import mongoose, { Schema, model } from "mongoose";
import { ProfileInterface, TypeSlider } from "../interfaces/profile.interface";

const ProfileSchema = new Schema<ProfileInterface>(
    {
        profile_pictury: {
            type: String,
            default: 'https://crew-web-catalgs.s3.us-east-2.amazonaws.com/profile.webp'
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
        },
        brand_color: {
            type: String,
            default: null,
            nullable: true,
        },
        whatsapp_message: {
            type: String,
            default: null,
            nullable: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const ProfileModel = model('profiles', ProfileSchema);
export default ProfileModel;