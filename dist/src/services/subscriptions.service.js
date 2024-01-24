"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const utils_1 = require("../utils/utils");
const handler_request_1 = require("../utils/handler.request");
const subscriptions_model_1 = __importDefault(require("../models/subscriptions.model"));
const api_responser_1 = require("../utils/api.responser");
const subscription_usability_service_1 = require("./subscription-usability.service");
class SubscriptionService extends subscription_usability_service_1.SubscriptionUsabilityService {
    constructor() {
        super();
        this.model = subscriptions_model_1.default;
        /**
         * Create new subscription
         * @param { Response } res
         * @param { SubscriptionsInterface } body
         * @param { User } user
         * @returns
         */
        this.createSubscription = async (res, body, user) => {
            try {
                const oldSubscription = await this.getLastSubscription(user._id);
                body.user_id = user._id;
                body.date_start = this.utils.getDate();
                body.date_end = this.utils.sumTimeToDate(body.date_start, 'day', this.billingPeriodTime[body.billing_period]);
                body.expired_at = body.date_start;
                const suscription = await this.model.create(body);
                // set usabilities
                await this.generateUsabilities(suscription.id, res, suscription.plan_id, oldSubscription);
                // return data
                return (0, api_responser_1.successResponse)(res, suscription, 'Subscription created success');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error creating subscription');
            }
        };
        /**
         * Create new subscription
         * @param res
         * @param { string } id
         * @param { User } user
         * @returns
         */
        this.cancelSubscription = async (res, id, user) => {
            try {
                const subscription = await this.disableSubscription(id);
                if (subscription) {
                    return (0, api_responser_1.successResponse)(res, subscription, 'Subscription cancel success');
                }
                return (0, api_responser_1.notFountResponse)(res, id, 'dont exists any active subscription with this id');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error cancel subscription');
            }
        };
        /**
         * Filter subscriptions by key and value
         * @param { string } key
         * @param { any } value
         * @param { boolean } expired
         * @returns { Promise<SubscriptionsInterface | null> }
         */
        this.getSubscription = async (key, value, expired = false) => {
            try {
                const query = {
                    [key]: value,
                    expired_at: null
                };
                if (expired) {
                    // Si expired es true, filtra por suscripciones que NO estén en null
                    query.expired_at = { $ne: null };
                }
                const subscription = await this.model.findOne(query);
                return subscription;
            }
            catch (error) {
                throw error;
            }
        };
        /**
         * Disable subscription
         * @param id
         * @returns { Promise<boolean> }
         */
        this.disableSubscription = async (id) => {
            const subscription = await this.getSubscription('_id', id, false);
            if (subscription) {
                const expiredAt = this.utils.getDate();
                subscription.expired_at = expiredAt;
                await subscription.save();
                return subscription;
            }
            return false;
        };
        /**
         * Get last subscription of user
         * @param userId
         * @returns { string | null }
         */
        this.getLastSubscription = async (userId) => {
            const subscription = await this.model.findOne({ user_id: userId })
                .sort({ createdAt: -1 }) // Ordena por createdAt en orden descendente
                .exec();
            if (subscription) {
                return subscription;
            }
            return subscription;
        };
        /**
         * epayco response
         * @param { Response } res
         * @param { string } refEpayco
         */
        this.responseEpayco = async (res, refEpayco) => {
            try {
                // get epayco data
                const epaycoData = await this.handlerRequest.doRequest(`/validation/v1/reference/${refEpayco}`, 'get', null);
                // si la respuesta es correcta
                if (epaycoData === null || epaycoData === void 0 ? void 0 : epaycoData.success) {
                    const { data } = epaycoData;
                    const subscription = await this.model.findById(data['x_extra1']);
                    if (subscription) {
                        let status = true;
                        if (data['x_transaction_state'] === 'Aceptada' && data['x_cod_response'] === 1) {
                            subscription.expired_at = null;
                            await subscription.save();
                        }
                        if (data['x_transaction_state'] === 'Rechazada' || data['x_transaction_state'] === 'Fallida') {
                            await this.deleteUsabilities(subscription.id);
                            await this.model.findOneAndDelete({ _id: subscription.id });
                        }
                        // Redirigir a otra URL
                        return res.redirect(`${process.env.APP_URL}/dashboard/profile?subscription=${subscription.id}&success=${status}&status=${data['x_transaction_state']}`);
                    }
                    return (0, api_responser_1.errorResponse)(res, null, `Subscription id ${data['x_extra1']} don't exists`);
                }
                // si obtenemos error
                if ((epaycoData === null || epaycoData === void 0 ? void 0 : epaycoData.data) && (epaycoData === null || epaycoData === void 0 ? void 0 : epaycoData.data.status) === 'error') {
                    return (0, api_responser_1.errorResponse)(res, null, epaycoData === null || epaycoData === void 0 ? void 0 : epaycoData.data.description);
                }
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error epayco response');
            }
        };
        /**
         * confirmation response epayco
         * @param { Response } res
         * @param { EpaycoConfirmationBodyInterface } body
         */
        this.confirmationEpayco = async (res, body) => {
            try {
                const { x_ref_payco, x_transaction_id, x_amount, x_currency_code, x_signature, x_cod_response, x_id_invoice } = body;
                // get encrypt signature for validate epayco
                const signatureString = `${this.epaycoCustomIdClient}^${this.epaycoPrivateKey}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`;
                const signature = await this.utils.doHash(signatureString);
                // procedemos a validar la orden
                if (signature === x_signature) {
                    // get subscription id
                    const idSubscription = x_id_invoice.split('_').pop();
                    const subscription = await this.model.findById(idSubscription);
                    if (subscription) {
                        // valdiate order status
                        switch (parseInt(x_cod_response)) {
                            case 1:
                                subscription.expired_at = null;
                                await subscription.save();
                                break;
                            case 3:
                                subscription.expired_at = null;
                                await subscription.save();
                                break;
                            default:
                                await this.deleteUsabilities(subscription.id);
                                await this.model.findOneAndDelete({ _id: subscription.id });
                                break;
                        }
                        // return success response
                        return (0, api_responser_1.successResponse)(res, subscription, 'The subscription status has been validated correctly');
                    }
                    // return response if no isset idSunscription
                    return (0, api_responser_1.errorResponse)(res, idSubscription, 'The subscription id does not exist in our records');
                }
                // return response if signature validations is invalid
                return (0, api_responser_1.errorResponse)(res, { signature, x_signature }, 'Validation signatures do not match');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Transaction confirmation failed.');
            }
        };
        this.params = {};
        this.utils = new utils_1.Utils();
        this.externalUrl = 'https://secure.epayco.co';
        this.billingPeriodTime = { Monthly: 30, Yearly: 365 };
        this.epaycoPrivateKey = process.env.EPAYCO_PRIVATE_KEY;
        this.epaycoCustomIdClient = process.env.EPAYCO_ID_CLIENT;
        this.handlerRequest = new handler_request_1.HandlerRequest(this.externalUrl, this.params);
    }
}
exports.SubscriptionService = SubscriptionService;
