import mongoose, { ObjectId } from "mongoose";

export interface OrderInterface {
    client: ClientInterface;
    total: number;
    tax: number;
    base?: number;
    total_tax: number;
    items: ItemsInterface[];
    user_id: string | mongoose.Schema.Types.ObjectId;
    catalogue_id: string | mongoose.Schema.Types.ObjectId;
}

export interface ClientInterface {
    name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    document: string;
    country: string;
}

export interface ItemsInterface {
    attribute: string;
    price: number;
    quantity: number;
    reference: string;
    tax: number;
    total?: number;
    total_tax?: number;
    product_id: ObjectId;
    parent?: string;
    base?: number;
}
