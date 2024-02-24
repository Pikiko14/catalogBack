import { ObjectId } from "mongoose";

export interface VisitsInterface {
    city: string;
    country: string;
    ip: string;
    loc: string;
    org: string;
    postal: string;
    region: string;
    timezone: string;
    catalogue_id: string | ObjectId;
    user_id: string | ObjectId;
}