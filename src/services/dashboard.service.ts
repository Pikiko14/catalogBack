import { Response } from "express";
import { Utils } from "../utils/utils";
import ProductModel from "../models/products.model";
import { errorResponse, successResponse } from "../utils/api.responser";

export class DashboardService {
    utils: Utils;
    productModel: any = ProductModel;

    constructor() {
        this.utils = new Utils();
    }

    /**
     * List metrics
     * @param { Response } res
     * @param { string } userId
     * @returns
     */
    listMetrics = async (res: Response, userId: string) => {
        try {
            // get data
            const moreAddToCart = await this.productModel.getTopAddedToCartByUser(userId);
            // return data
            return successResponse(
                res,
                {
                    moreAddToCart,
                },
                'Metrics data'
            );
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error listing metrics');
        }
    }
}
