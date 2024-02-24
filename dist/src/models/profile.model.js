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
const mongoose_1 = __importStar(require("mongoose"));
const profile_interface_1 = require("../interfaces/profile.interface");
const ProfileSchema = new mongoose_1.Schema({
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
        enum: Object.values(profile_interface_1.TypeSlider),
        default: profile_interface_1.TypeSlider.Simple,
    },
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
    versionKey: false,
});
const ProfileModel = (0, mongoose_1.model)('profiles', ProfileSchema);
exports.default = ProfileModel;
