import mongoose from "mongoose";
import { TypeCharacteristics } from "../models/plan.model";

export interface SubscriptionUsabilityInterface {
    _id?: string;
    subscription_id: string | mongoose.Schema.Types.ObjectId;
    path: string;
    method: string;
    used: number;
    total: number;
    type_characteristics?: TypeCharacteristics;
}