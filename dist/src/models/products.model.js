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
const mongodb_1 = require("mongodb");
const utils_1 = require("../utils/utils");
const mongoose_1 = __importStar(require("mongoose"));
const s3_service_1 = require("../services/aws/s3/s3.service");
const products_interface_1 = require("../interfaces/products.interface");
// instances
const utils = new utils_1.Utils();
const s3Service = new s3_service_1.S3Service();
// schemas
const PricesSchema = new mongoose_1.Schema({
    value: {
        type: Number,
        required: true,
    },
    position: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        required: true,
    },
});
const MediaProductSchema = new mongoose_1.Schema({
    path: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: products_interface_1.TypeMediaEnum,
        required: true,
        default: products_interface_1.TypeMediaEnum.image,
    },
    provider: {
        type: String,
        enum: products_interface_1.ProviderMediaEnum,
        required: true,
        default: products_interface_1.ProviderMediaEnum.owner,
    },
    deleted: {
        type: Boolean,
        required: false,
        default: false,
    },
});
const VariantsSchema = new mongoose_1.Schema({
    tax: {
        type: Number,
        required: false,
    },
    reference: {
        type: String,
        required: true,
    },
    attribute: {
        type: String,
        required: true,
    },
    prices: {
        type: [PricesSchema],
        required: false,
    },
    medias: {
        type: [MediaProductSchema],
        required: false,
    },
});
const RatingsSchema = new mongoose_1.Schema({
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    name_client: {
        type: String,
        required: true,
    },
});
const ProductsSchema = new mongoose_1.Schema({
    tax: {
        default: 0,
        type: Number,
        nullable: true,
    },
    name: {
        type: String,
        nullable: false,
        default: '',
    },
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'users',
        nullable: false,
    },
    reference: {
        type: String,
        nullable: false,
        default: '',
    },
    description: {
        type: String,
        nullable: false,
        default: '',
    },
    prices: {
        type: [PricesSchema],
        required: true,
    },
    count_add_to_cart: {
        type: Number,
        nullable: true,
    },
    count_order_finish: {
        type: Number,
        nullable: true,
    },
    ratings: {
        type: [RatingsSchema],
        nullable: true,
    },
    unit_of_measurement: {
        type: String,
        nullable: true,
    },
    variants: {
        type: [VariantsSchema],
        nullable: true,
    },
    medias: {
        type: [MediaProductSchema],
        nullable: true,
    },
    categories: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'categories'
        }],
    default_image: {
        type: MediaProductSchema,
        default: null,
    },
}, {
    timestamps: true,
    versionKey: false,
});
// MIDDLEWARE ACTIONS
// Define un middleware pre para el evento 'remove'
ProductsSchema.pre('findOneAndDelete', { document: true, query: true }, async function (next) {
    const product = await this.model.findOne(this.getQuery()).exec();
    try {
        for (const media of product.medias) {
            if (media.path && media.path.includes('.s3.us-east-2')) {
                const key = media.path.split('/').pop();
                await s3Service.deleteSingleObject(key);
            }
            else {
                await utils.deleteItemFromStorage(media.path);
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
ProductsSchema.statics.getTopAddedToCartByUser = async function (user_id) {
    try {
        const result = await this.aggregate([
            { $match: { user_id: new mongodb_1.ObjectId(user_id) } }, // filter for user id
            { $sort: { count_add_to_cart: -1 } }, // sort by attribute desc
            { $limit: 5 }, // limit query
            {
                $project: {
                    name: 1,
                    count_add_to_cart: {
                        $ifNull: ["$count_add_to_cart", 0] // condiftion for attribute count
                    }
                }
            }
        ]);
        return result;
    }
    catch (error) {
        throw error;
    }
};
ProductsSchema.statics.getTopSoldByUser = async function (user_id) {
    try {
        const result = await this.aggregate([
            { $match: { user_id: new mongodb_1.ObjectId(user_id) } },
            { $sort: { count_order_finish: -1 } },
            { $limit: 5 },
            {
                $project: {
                    name: 1,
                    count_order_finish: {
                        $ifNull: ["$count_order_finish", 0] // condiftion for attribute count
                    }
                }
            }
        ]);
        return result;
    }
    catch (error) {
        throw error;
    }
};
// compile model
const ProductModel = (0, mongoose_1.model)('products', ProductsSchema);
exports.default = ProductModel;
