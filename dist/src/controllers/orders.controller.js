"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const express_validator_1 = require("express-validator");
const orders_service_1 = require("../services/orders.service");
const api_responser_1 = require("../utils/api.responser");
class OrdersController {
    constructor() {
        /**
         * create order
         * @param { RequestExt } req
         * @param { Response } res
         * @return { Promise }
         */
        this.createOrder = async (req, res) => {
            try {
                const body = (0, express_validator_1.matchedData)(req);
                await this.service.createOrder(res, body, '');
            }
            catch (error) {
                return (0, api_responser_1.unProcesableEntityResponse)(res, error, error.message);
            }
        };
        this.service = new orders_service_1.OrdersService();
    }
}
exports.OrdersController = OrdersController;
