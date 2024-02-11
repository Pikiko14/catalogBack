import mongoose, { Schema, model } from "mongoose";
import { OrderInterface } from "../interfaces/orders.interface";

const OrdersSchema = new Schema<OrderInterface>(
    {
        client: {
            name: {
                type: String,
                nullable: false,
                default: '',
            },
            last_name: {
                type: String,
                nullable: false,
                default: '',
            },
            email: {
                type: String,
                nullable: false,
                default: '',
            },
            phone: {
                type: String,
                nullable: false,
                default: '',
            },
            address: {
                type: String,
                nullable: false,
                default: '',
            },
            city: {
                type: String,
                nullable: false,
                default: '',
            },
            document: {
                type: String,
                nullable: false,
                default: '',
            },
            country: {
                type: String,
                nullable: false,
                default: '',
            },
        },
        total: {
            type: Number,
            nullable: false,
            default: 0,
        },
        tax: {
            type: Number,
            nullable: false,
            default: 0,
        },
        total_tax: {
            type: Number,
            nullable: false,
            default: 0,
        },
        items: [{
            attribute: {
                type: String,
                nullable: false,
                default: '',
            },
            price: {
                type: Number,
                nullable: false,
                default: 0,
            },
            quantity: {
                type: Number,
                nullable: false,
                default: 0,
            },
            reference: {
                type: String,
                nullable: false,
                default: '',
            },
            tax: {
                type: Number,
                nullable: false,
                default: 0,
            },
            total: {
                type: Number,
                nullable: false,
                default: 0,
            },
            taxTotal: {
                type: Number,
                nullable: false,
                default: 0,
            },
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
            },
        }]
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const OrdersModel = model('orders', OrdersSchema);
export default OrdersModel;
