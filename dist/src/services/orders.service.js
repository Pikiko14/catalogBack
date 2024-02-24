"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const orders_models_1 = __importDefault(require("./../models/orders.models"));
const products_service_1 = require("./products.service");
const catalogues_service_1 = require("./catalogues.service");
const api_responser_1 = require("../utils/api.responser");
class OrdersService {
    constructor() {
        this.tax = 0;
        this.base = 0;
        this.total = 0;
        this.total_tax = 0;
        this.model = orders_models_1.default;
        /**
         * Create order
         * @param { Response } res
         * @param { OrderInterface } body
         * @param { string } userId
         */
        this.createOrder = async (res, body, userId) => {
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
                body.total_tax = parseFloat(this.total_tax.toFixed(2));
                const catalogue = await this.catalogueService.findById(body.catalogue_id);
                if (catalogue) {
                    body.user_id = catalogue.user_id.toString();
                }
                // save order to bbdd
                const order = await this.model.create(body);
                if (!order) {
                    throw new Error('Error on order creation');
                }
                // validate products for up order buying
                if (productsIds.length > 0) {
                    await this.productService.addMoreSellStatus(productsIds);
                }
                // retur data
                return (0, api_responser_1.successResponse)(res, order, 'Order created success');
            }
            catch (error) {
                throw error;
            }
        };
        this.productService = new products_service_1.ProductsService();
        this.catalogueService = new catalogues_service_1.CatalogueService();
    }
}
exports.OrdersService = OrdersService;
