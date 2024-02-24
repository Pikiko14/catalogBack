import { Response } from "express";
import OrdersModel from './../models/orders.models';
import { ProductsService } from "./products.service";
import { CatalogueService } from "./catalogues.service";
import { successResponse } from "../utils/api.responser";
import { Catalogue } from "../interfaces/catalogues.interface";
import { OrderInterface } from "../interfaces/orders.interface";

export class OrdersService {
    tax: number = 0;
    base: number = 0;
    total: number = 0;
    total_tax: number = 0
    model: any = OrdersModel;
    productService: ProductsService;
    catalogueService: CatalogueService;

    constructor() {
        this.productService = new ProductsService();
        this.catalogueService = new CatalogueService();
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
            body.base = parseFloat(this.base.toFixed(2));
            body.total = parseFloat(this.total.toFixed(2));
            body.total_tax =  parseFloat(this.total_tax.toFixed(2));
            const catalogue = await this.catalogueService.findById(body.catalogue_id as any) as Catalogue;
            if (catalogue) {
                body.user_id = catalogue.user_id.toString();
            }
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