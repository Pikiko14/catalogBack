import { Response } from "express";
import { Utils } from "../utils/utils";
import ProductModel from "../models/products.model";
import { MetricsData } from "../interfaces/dashboard.interface";
import { errorResponse, successResponse } from "../utils/api.responser";

export class DashboardService {
    utils: Utils;
    moreAddCart: MetricsData;
    moreSellers: MetricsData;
    productModel: any = ProductModel;

    constructor() {
        this.utils = new Utils();
        this.moreAddCart = {
            labels: [],
            data: [],
        }
        this.moreSellers = {
            labels: [],
            data: [],
        }
    }

    /**
     * List metrics
     * @param { Response } res
     * @param { string } userId
     * @returns
     */
    listMetrics = async (res: Response, userId: string) => {
        try {
            // get data more add
            await this.loadMetricsMoreAddCart(userId);
            await this.loadMetricsMoreSellers(userId);
            // return data
            return successResponse(
                res, 
                {
                    moreSellers: this.moreSellers,
                    moreAddToCart: this.moreAddCart,
                },
                'Metrics data',
            );
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error listing metrics');
        }
    }

    /**
     * Load more add to cart
     * @param { string } userId
     * @return
     */
    public async loadMetricsMoreAddCart (userId: string): Promise<void> {
        const moreAddData = await this.productModel.getTopAddedToCartByUser(userId);
        if (moreAddData.length > 0) {
            for (const moreAdd of moreAddData) {
                this.moreAddCart.labels.push(moreAdd.name);
                this.moreAddCart.data.push(moreAdd.count_add_to_cart);
            }
        }
    }

    /**
     * Load more sell
     * @param { string } userId
     * @return
     */
    public async loadMetricsMoreSellers (userId: string): Promise<void> {
        const moreAddData = await this.productModel.getTopSoldByUser(userId);
        if (moreAddData.length > 0) {
            for (const moreAdd of moreAddData) {
                this.moreSellers.labels.push(moreAdd.name);
                this.moreSellers.data.push(moreAdd.count_order_finish);
            }
        }
    }
}
