import { Response } from "express";
import OrdersModel from './../models/orders.models';
import { successResponse } from "../utils/api.responser";
import { OrderInterface } from "../interfaces/orders.interface";
import { ProductsService } from "./products.service";

export class OrdersService {
    tax: number = 0;
    base: number = 0;
    total: number = 0;
    total_tax: number = 0
    model: any = OrdersModel;
    productService: ProductsService;

    constructor() {
        this.productService = new ProductsService();
    }

    /**
     * Create order
     * @param { Response } res
     * @param { OrderInterface } body
     * @param { string } userId
     */
    createOrder = async (res: Response, body: OrderInterface, userId: string) => {
        try {
            // products id array to up
            const productsIds = [];
            // calculate order tax, total, and tax total
            for (const item of body.items) {
                // pus parent id to products ids array
                productsIds.push(item.parent);
                // calculate tax
                this.tax = item.tax;
                this.base += item.base || 0;
                this.total += item.total || 0;
                this.total_tax += item.total_tax || 0;
                if (this.tax !== item.tax) {
                    this.tax = 0;
                }
            }
            body.tax = this.tax;
            body.base = this.base;
            body.total = this.total;
            body.total_tax = this.total_tax;
            // save order to bbdd
            const order = await this.model.create(body)
            if (!order) {
                throw new Error('Error on order creation');
            }
            // validate products for up order buying
            if (productsIds.length > 0) {
                await this.productService.addMoreSellStatus(productsIds as any);
            }
            // retur data
            return successResponse(res, order, 'Order created success');
        } catch (error) {
            throw error;
        }
    }
}