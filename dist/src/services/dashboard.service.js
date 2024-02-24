"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const utils_1 = require("../utils/utils");
const visits_model_1 = __importDefault(require("../models/visits.model"));
const products_model_1 = __importDefault(require("../models/products.model"));
const api_responser_1 = require("../utils/api.responser");
const mongoose_1 = __importDefault(require("mongoose"));
class DashboardService {
    constructor() {
        this.productModel = products_model_1.default;
        this.visitsModel = visits_model_1.default;
        /**
         * List metrics
         * @param { Response } res
         * @param { string } userId
         * @returns
         */
        this.listMetrics = async (res, userId) => {
            try {
                // clear data
                this.clearData();
                // get data more add
                await this.loadMetricsMoreAddCart(userId);
                await this.loadMetricsMoreSellers(userId);
                await this.loadCityMoreVisit(userId);
                const visits = await this.loadLocationData(userId);
                // return data
                return (0, api_responser_1.successResponse)(res, {
                    moreSellers: this.moreSellers,
                    moreAddToCart: this.moreAddCart,
                    visitByCity: this.cityMoreVisit,
                    visits,
                }, 'Metrics data');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error.message, 'Error listing metrics');
            }
        };
        this.utils = new utils_1.Utils();
        this.moreAddCart = {
            labels: [],
            data: [],
        };
        this.moreSellers = {
            labels: [],
            data: [],
        };
        this.cityMoreVisit = {
            labels: [],
            data: [],
        };
    }
    /**
     * Load more add to cart
     * @param { string } userId
     * @return
     */
    async loadMetricsMoreAddCart(userId) {
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
    async loadMetricsMoreSellers(userId) {
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
    async loadCityMoreVisit(userId) {
        const visits = await this.visitsModel.aggregate([
            {
                $match: { user_id: new mongoose_1.default.Types.ObjectId(userId) } // Filtrar por el ID de usuario
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
     * Load visits list
     * @param { string } userId
     * @return
     */
    async loadLocationData(userId) {
        const locations = await this.visitsModel.aggregate([
            {
                $match: { user_id: new mongoose_1.default.Types.ObjectId(userId) } // Filtrar por el ID de usuario
            },
            {
                $sort: { createdAt: -1 } // Ordenar las visitas por fecha de creación en orden descendente
            },
            {
                $limit: 1000 // Limitar a las últimas 1000 visitas
            },
            {
                $group: {
                    _id: '$city', // Agrupar por la ciudad
                    locs: { $push: '$loc' } // Obtener todas las ubicaciones de visita en cada ciudad
                }
            },
            {
                $project: {
                    _id: 0, // Excluir el campo _id
                    country: '$country', // Extraer el país del modelo
                    region: '$region', // Extraer la región del modelo
                    city: '$_id', // Utilizar el nombre de la ciudad como city
                    locations: '$locs' // Retener todas las ubicaciones de visita en un array
                }
            },
            {
                $unwind: '$locations' // Descomponer el array de ubicaciones
            },
            {
                $project: {
                    country: 1,
                    region: 1,
                    city: 1,
                    lat: { $arrayElemAt: [{ $split: ['$locations', ','] }, 0] }, // Extraer la latitud
                    long: { $arrayElemAt: [{ $split: ['$locations', ','] }, 1] } // Extraer la longitud
                }
            }
        ]);
        return locations;
    }
    /**
     * Clear data
     */
    clearData() {
        this.moreAddCart.data = [];
        this.moreAddCart.labels = [];
        this.moreSellers.data = [];
        this.moreSellers.labels = [];
        this.cityMoreVisit.data = [];
        this.cityMoreVisit.labels = [];
    }
}
exports.DashboardService = DashboardService;
