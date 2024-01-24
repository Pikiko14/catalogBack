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
const subscriptions_interface_1 = require("./../interfaces/subscriptions.interface");
const SubscriptionsSchema = new mongoose_1.Schema({
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'users'
    },
    plan_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'plans'
    },
    date_start: {
        type: Date,
        nullable: true,
        default: null
    },
    date_end: {
        type: Date,
        nullable: true,
        default: null
    },
    expired_at: {
        type: Date,
        nullable: true,
        default: null
    },
    auto_renew: {
        type: Boolean,
        default: false
    },
    billing_period: {
        type: String,
        enum: Object.values(subscriptions_interface_1.BillingPeriod),
        required: true,
        default: subscriptions_interface_1.BillingPeriod.Monthly
    }
}, {
    timestamps: true,
    versionKey: false,
});
const SubscriptionsModel = (0, mongoose_1.model)('subscriptions', SubscriptionsSchema);
exports.default = SubscriptionsModel;
