"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils/utils");
const users_service_1 = require("../services/users.service");
const s3_service_1 = require("../services/aws/s3/s3.service");
const mongoose_1 = __importStar(require("mongoose"));
//intances
const utils = new utils_1.Utils();
const s3Service = new s3_service_1.S3Service();
const userService = new users_service_1.UserService();
const CatalogueSchema = new mongoose_1.Schema({
    name: {
        type: String,
        nullable: true,
        default: '',
    },
    start_date: {
        type: Date,
        default: Date.now
    },
    end_date: {
        type: Date,
        default: Date.now
    },
    is_active: {
        type: Boolean,
        default: false
    },
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'users'
    },
    pages: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'pages'
        }],
    cover: {
        type: String,
        nullable: true
    }
}, {
    timestamps: true,
    versionKey: false,
});
// MIDDLEWARE ACTIONS// Define un middleware pre para el evento 'remove'
CatalogueSchema.pre('findOneAndDelete', { document: true, query: true }, async function (next) {
    const catalog = await this.model.findOne(this.getQuery()).exec(); // Obtiene el catálogo antes de eliminarlo
    try {
        await userService.deleteCatalog(catalog.user_id, catalog._id); // delete catalog from user
        // delete cover from s3
        if (catalog.cover && catalog.cover.includes('.s3.us-east-2')) {
            const key = catalog.cover.split('/').pop();
            await s3Service.deleteSingleObject(key);
            // delete from local storage
        }
        else {
            await utils.deleteItemFromStorage(catalog.cover); // delete cover from catalog
        }
        // delete pages
        for (const pageId of catalog.pages) {
            const page = await (0, mongoose_1.model)('pages').findById(pageId).exec();
            // Elimina los archivos de imágenes de la página
            if (page && page.images) {
                for (const image of page.images) {
                    await utils.deleteItemFromStorage(image);
                }
            }
            // Elimina la página
            await (0, mongoose_1.model)('pages').findByIdAndDelete(pageId).exec();
        }
        // commit a la base de datos
        next();
    }
    catch (error) {
        next(error);
    }
});
// FINISH MIDDLEWARE ACTIONS
const CatalogueModel = (0, mongoose_1.model)('catalogues', CatalogueSchema);
exports.default = CatalogueModel;
