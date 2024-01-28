import { ObjectId } from 'mongodb';
import { Utils } from "../utils/utils";
import mongoose, { Schema, model } from "mongoose";
import { ProductInterface, ProviderMediaEnum, TypeMediaEnum } from "../interfaces/products.interface";

// instances
const utils = new Utils();

// schemas
const PricesSchema = new Schema(
    {
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
    }
);

const MediaProductSchema = new Schema(
    {
        path: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: TypeMediaEnum,
            required: true,
            default: TypeMediaEnum.image,
        },
        provider: {
            type: String,
            enum: ProviderMediaEnum,
            required: true,
            default: ProviderMediaEnum.owner,
        },
        deleted: {
            type: Boolean,
            required: false,
            default: false,
        },
    }
);

const VariantsSchema = new Schema(
    {
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
    }
);

const RatingsSchema = new Schema(
    {
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
    }
);

const ProductsSchema = new Schema<ProductInterface>(
    {
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
            type: mongoose.Schema.Types.ObjectId,
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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'categories'
        }],
        default_image: {
            type: MediaProductSchema,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// MIDDLEWARE ACTIONS

// Define un middleware pre para el evento 'remove'
ProductsSchema.pre('findOneAndDelete', { document: true, query: true }, async function (next: any) {
    const product = await this.model.findOne(this.getQuery()).exec();
    try {
        for (const media of product.medias) {
            await utils.deleteItemFromStorage(media.path);
        }
        next();
    } catch (error) {
        next(error);
    }
});

ProductsSchema.statics.getTopAddedToCartByUser = async function(user_id) {
    try {
        const result = await this.aggregate([
            { $match: { user_id: new ObjectId(user_id)} }, // filter for user id
            { $sort: { count_add_to_cart: -1 } }, // sort by attribute desc
            { $limit: 5 }, // limit query
            { 
                $project: {
                    name: 1, 
                    count_add_to_cart: {
                        $ifNull: [ "$count_add_to_cart", 0 ] // condiftion for attribute count
                    }
                }
            }
        ]);
        return result;
    } catch (error) {
        throw error;
    }
};

ProductsSchema.statics.getTopSoldByUser = async function(user_id) {
    try {
        const result = await this.aggregate([
            { $match: { user_id: new ObjectId(user_id) } },
            { $sort: { count_order_finish: -1 } },
            { $limit: 5 },
            {
                $project: {
                    name: 1,
                    count_order_finish: {
                        $ifNull: [ "$count_order_finish", 0 ] // condiftion for attribute count
                    }
                }
            }
        ]);
        return result;
    } catch (error) {
        throw error;
    }
};

// compile model
const ProductModel = model('products', ProductsSchema);
export default ProductModel;
