import { ObjectId } from "mongoose";

export interface OrderInterface {
    client: ClientInterface;
    total: number;
    tax: number;
    total_tax: number;
    items: ItemsInterface[];
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
    taxTotal?: number | string;
    product_id: ObjectId;
}
