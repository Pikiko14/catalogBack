import { Response } from "express";
import OrdersModel from './../models/orders.models';
import { OrderInterface } from "../interfaces/orders.interface";
import { successResponse } from "../utils/api.responser";

export class OrdersService {
    model: any = OrdersModel;

    constructor() {}

    /**
     * Create order
     * @param { Response } res
     * @param { OrderInterface } body
     * @param { string } userId
     */
    public createOrder(res: Response, body: OrderInterface, userId: string) {
        try {
            return successResponse(res, { body, userId }, 'Order created success');
        } catch (error) {
            throw error;
        }
    }
}