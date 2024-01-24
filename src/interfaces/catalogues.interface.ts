import mongoose from "mongoose";

export interface Catalogue {
    id?: string;
    _id: string;
    name: string;
    start_date: Date;
    end_date: Date;
    is_active: boolean;
    user_id: mongoose.Schema.Types.ObjectId;
    pages: mongoose.Schema.Types.ObjectId[],
    cover: string;
}