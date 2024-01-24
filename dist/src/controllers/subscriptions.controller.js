"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const express_validator_1 = require("express-validator");
const api_responser_1 = require("../utils/api.responser");
const subscriptions_service_1 = require("../services/subscriptions.service");
class SubscriptionController {
    constructor() {
        /**
         * Create new subscription
         * @param req
         * @param res
         * @returns
         */
        this.createSubscription = async (req, res) => {
            try {
                const { user } = req;
                const body = (0, express_validator_1.matchedData)(req);
                await this.service.createSubscription(res, body, user);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error creating subscription');
            }
        };
        /**
         * Cancel subscription
         * @param req
         * @param res
         * @returns
         */
        this.cancelSubscription = async (req, res) => {
            try {
                const { user } = req;
                const { id } = req.params;
                await this.service.cancelSubscription(res, id, user);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error creating subscription');
            }
        };
        /**
         * epayco confirmation
         * @param req
         * @param res
         * @returns
         */
        this.confirmationEpayco = async (req, res) => {
            try {
                console.log('confirmation Epayco');
                console.log(req.body);
                await this.service.confirmationEpayco(res, req.body);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error creating subscription');
            }
        };
        /**
         * epayco response
         * @param req
         * @param res
         * @returns
         */
        this.responseEpayco = async (req, res) => {
            try {
                const { ref_payco } = req.query;
                await this.service.responseEpayco(res, ref_payco);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error creating subscription');
            }
        };
        this.service = new subscriptions_service_1.SubscriptionService();
    }
}
exports.SubscriptionController = SubscriptionController;
