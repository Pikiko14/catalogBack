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
const plan_model_1 = require("./plan.model");
const SubscriptionUsabilitySchema = new mongoose_1.Schema({
    subscription_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        nullable: false,
        ref: 'subscriptions'
    },
    path: {
        type: String,
        nullable: false,
    },
    method: {
        type: String,
        nullable: false,
    },
    used: {
        type: Number,
        nullable: false,
        default: 0,
    },
    total: {
        type: Number,
        nullable: false,
    },
    type_characteristics: {
        type: String,
        enum: Object.values(plan_model_1.TypeCharacteristics),
        default: plan_model_1.TypeCharacteristics.QUANTITY,
        required: true,
    }
}, {
    timestamps: true,
    versionKey: false
});
const SubscriptionUsabilityModel = (0, mongoose_1.model)('subscription_usability', SubscriptionUsabilitySchema);
exports.default = SubscriptionUsabilityModel;
