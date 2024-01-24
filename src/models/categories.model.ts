import mongoose, { Schema, model } from "mongoose";
import { CategoryInterface } from "../interfaces/categories.interface";

const CategoriesSchema = new Schema<CategoryInterface>(
    {
        name: {
            type: String,
            nullable: false,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            nullable: false,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const CategoriesModel = model('categories', CategoriesSchema);
export default CategoriesModel;
