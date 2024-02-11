import { Response } from "express";
import { Utils } from "../utils/utils";
import VisitModel from "../models/visits.model";
import ProductModel from "../models/products.model";
import { MetricsData } from "../interfaces/dashboard.interface";
import { errorResponse, successResponse } from "../utils/api.responser";
import mongoose from "mongoose";

export class DashboardService {
    utils: Utils;
    moreAddCart: MetricsData;
    moreSellers: MetricsData;
    cityMoreVisit: MetricsData;
    productModel: any = ProductModel;
    visitsModel: any = VisitModel;

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
        this.cityMoreVisit = {
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
            // clear data
            this.clearData();
            // get data more add
            await this.loadMetricsMoreAddCart(userId);
            await this.loadMetricsMoreSellers(userId);
            await this.loadCityMoreVisit(userId);
            // return data
            return successResponse(
                res, 
                {
                    moreSellers: this.moreSellers,
                    moreAddToCart: this.moreAddCart,
                    visitByCity: this.cityMoreVisit,
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

    /**
     * Load more sell
     * @param { string } userId
     * @return
     */
    public async loadCityMoreVisit (userId: string): Promise<void> {
        const visits = await this.visitsModel.aggregate([
            {
                $match: { user_id: new mongoose.Types.ObjectId(userId) } // Filtrar por el ID de usuario
            },
            {
                $group: {
                    _id: '$city', // Agrupar por la ciudad
                    count: { $sum: 1 } // Contar el número de visitas en cada ciudad
                }
            },
            {
                $project: {
                    city: '$_id', // Renombrar _id como city
                    count: 1, // Incluir el campo count
                    _id: 0 // Excluir el campo _id
                }
            },
            {
                $limit: 5 // Limitar a las 5 ciudades con más visitas
            }
        ]);
        for (const visit of visits) {
            this.cityMoreVisit.data.push(visit.count);
            this.cityMoreVisit.labels.push(visit.city);
        }
    }

    /**
     * Clear data
     */
    public clearData() {
        this.moreAddCart.data = [];
        this.moreAddCart.labels = [];
        this.moreSellers.data = [];
        this.moreSellers.labels = [];
        this.cityMoreVisit.data = [];
        this.cityMoreVisit.labels = [];
    }
}
