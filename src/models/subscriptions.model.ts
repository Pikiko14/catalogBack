import mongoose, { model, Schema} from "mongoose";
import { BillingPeriod, SubscriptionsInterface } from './../interfaces/subscriptions.interface';

const SubscriptionsSchema = new Schema<SubscriptionsInterface>(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        plan_id: {
            type: mongoose.Schema.Types.ObjectId,
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
            enum: Object.values(BillingPeriod),
            required: true,
            default: BillingPeriod.Monthly
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const SubscriptionsModel = model('subscriptions', SubscriptionsSchema);
export default SubscriptionsModel;
