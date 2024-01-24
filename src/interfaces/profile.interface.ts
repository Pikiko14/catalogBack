import mongoose from "mongoose";
import { SubscriptionsInterface } from "./subscriptions.interface";

export interface ProfileInterface {
    profile_pictury?: string;
    brand_name?: string;
    phone_number?: string;
    country?: string;
    city?: string;
    address?: string;
    website?: string;
    type_slider?: TypeSlider;
    user_id: mongoose.Schema.Types.ObjectId;
    subscription?: SubscriptionsInterface | null;
}

// Define el enum
export enum TypeSlider {
    Simple = 'Simple',
    Double = 'Double',
    Landing = 'Landing',
}
