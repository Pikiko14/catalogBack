import mongoose from "mongoose";

export interface PagesInterface {
    _id?: string;
    id?: string;
    number: number,
    type: string,
    catalogue_id: mongoose.Schema.Types.ObjectId;
    images: Images[];
}

export interface Images {
    path: string;
    order: number;
    buttons?: any[];
}

export interface ConvertedImg {
    name:     string | any;
    size:     string | any;
    fileSize: number | any;
    path:     string | any;
    page:     number | any;
}