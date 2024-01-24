import mongoose, { Schema, model } from "mongoose";
import { ProfileInterface, TypeSlider } from "../interfaces/profile.interface";

const ProfileSchema = new Schema<ProfileInterface>(
    {
        profile_pictury: {
            type: String,
            default: 'profile.webp'
        },
        brand_name: {
            type: String,
            default: null,
            nullable: true,
        },
        phone_number: {
            type: String,
            default: null,
            nullable: true,
        },
        country: {
            type: String,
            default: null,
            nullable: true,
        },
        city: {
            type: String,
            default: null,
            nullable: true,
        },
        address: {
            type: String,
            default: null,
            nullable: true,
        },
        website: {
            type: String,
            default: null,
            nullable: true,
        },
        type_slider: {
            type: String,
            enum: Object.values(TypeSlider),
            default: TypeSlider.Simple,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const ProfileModel = model('profiles', ProfileSchema);
export default ProfileModel;