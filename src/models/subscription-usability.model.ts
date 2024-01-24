import mongoose, { Schema, model } from "mongoose";
import { SubscriptionUsabilityInterface } from "../interfaces/SubscriptionUsability.interface";
import { TypeCharacteristics } from "./plan.model";

const SubscriptionUsabilitySchema = new Schema<SubscriptionUsabilityInterface>(
    {
        subscription_id: {
            type: mongoose.Schema.Types.ObjectId,
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
            enum: Object.values(TypeCharacteristics),
            default: TypeCharacteristics.QUANTITY,
            required: true,
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const SubscriptionUsabilityModel = model('subscription_usability', SubscriptionUsabilitySchema);

export default SubscriptionUsabilityModel;