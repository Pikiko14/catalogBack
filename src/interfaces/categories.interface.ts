import { ObjectId } from "mongoose";

export interface CategoryInterface {
    id?: string;
    _id?: string;
    name: string;
    image?: string;
    user_id: string | ObjectId | undefined;
}