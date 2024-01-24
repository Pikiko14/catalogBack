import mongoose, { Schema, Types, model, Model } from "mongoose";
import { User } from "../interfaces/users.interface";

const UserSchema = new Schema<User>(
    {
        username: {
            type: String,
            unique: true,
        },
        name: {
            type: String,
        },
        last_name: {
            type: String,
        },
        email: {
            type: String,
            unique: true,
        },
        password: {
            type: String,
        },
        role: {
            type: String,
            enum: ["admin", "employe", "super_admin"]
        },
        scopes: {
            type: [String],
        },
        parent: {
            type: String,
            default: null,
        },
        catalogues: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'catalogues'
        }]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const UserModel = model('users', UserSchema);

export default UserModel;