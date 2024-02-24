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
const mongoose_1 = __importStar(require("mongoose"));
const s3_service_1 = require("../services/aws/s3/s3.service");
const catalogues_service_1 = require("../services/catalogues.service");
// instances
const utils = new utils_1.Utils();
const s3Service = new s3_service_1.S3Service();
// declare schema
const PagesSchema = new mongoose_1.Schema({
    number: {
        type: Number,
        nullable: false
    },
    type: {
        type: String,
        enum: ['simple', 'double', 'triple'],
        default: 'simple'
    },
    catalogue_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'catalogues'
    },
    images: [{
            path: {
                type: String,
                default: ''
            },
            order: {
                type: Number,
                default: 1,
            },
            buttons: [{
                    x: {
                        type: String,
                    },
                    y: {
                        type: String,
                        default: ''
                    },
                    product: {
                        type: mongoose_1.default.Schema.Types.ObjectId,
                        ref: 'products'
                    }
                }],
        }]
}, {
    timestamps: true,
    versionKey: false
});
// MIDDLEWARE ACTIONS //
PagesSchema.pre('findOneAndDelete', { document: true, query: true }, async function (next) {
    const page = await this.model.findOne(this.getQuery()).exec(); // get page for delete in catalogs
    if (page) {
        try {
            const catalogueService = new catalogues_service_1.CatalogueService();
            await catalogueService.deleteCatalog(page.catalogue_id, page._id);
            if (page.images && page.images.length > 0) {
                for (const image of page.images) {
                    if (image.path && image.path.includes('.s3.us-east-2')) {
                        const key = image.path.split('/').pop();
                        await s3Service.deleteSingleObject(key);
                    }
                    else {
                        await utils.deleteItemFromStorage(image.path);
                    }
                }
            }
            next();
        }
        catch (error) {
            next(error);
        }
    }
});
// FINISH MIDDLEWARE ACTIONS
const PagesModel = (0, mongoose_1.model)('pages', PagesSchema);
exports.default = PagesModel;
