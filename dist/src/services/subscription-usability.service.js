"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionUsabilityService = void 0;
const subscription_usability_model_1 = __importDefault(require("../models/subscription-usability.model"));
const api_responser_1 = require("../utils/api.responser");
const utils_1 = require("../utils/utils");
const plans_service_1 = require("./plans.service");
class SubscriptionUsabilityService {
    constructor() {
        this.modelUsability = subscription_usability_model_1.default;
        /**
         * generate usabilities for subscription
         * @param { string } id
         * @param { Response } res
         * @param { string } planId
         */
        this.generateUsabilities = async (id, res, planId, oldSubscription) => {
            try {
                const plan = await this.planService.getPlan('_id', planId);
                const { characteristics } = plan;
                let subscriptionUsabilities = [];
                if (oldSubscription) {
                    subscriptionUsabilities = await this.modelUsability.find({
                        subscription_id: oldSubscription.id,
                    })
                        .select('path used') // Indica los campos que deseas obtener
                        .exec();
                }
                for (const characteristic of characteristics) {
                    let quantity = 0;
                    if (!characteristic.path.includes('pages') && subscriptionUsabilities.length > 0) {
                        const usabilityPreview = subscriptionUsabilities.find((item) => item.path === characteristic.path);
                        quantity = usabilityPreview ? usabilityPreview.used : 0;
                    }
                    ;
                    const data = {
                        method: characteristic.methods,
                        path: characteristic.path,
                        total: characteristic.quantity,
                        used: characteristic.type_characteristics === 'boolean' && characteristic.quantity > 0 ?
                            1 :
                            quantity,
                        subscription_id: id,
                        type_characteristics: characteristic.type_characteristics
                    };
                    await this.modelUsability.create(data);
                }
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error generating usabilities ');
            }
        };
        /**
         * validate hasAbility
         * @param subscriptionId
         * @param path
         * @param method
         * @returns
         */
        this.hasAbility = async (subscriptionId, path, method) => {
            const ability = await this.modelUsability.findOne({
                subscription_id: subscriptionId,
                path: path,
                method: method,
            });
            if (ability) {
                return ability;
            }
            return false;
        };
        /**
         * Validamos los usos de las caracteristicas
         * @param res
         * @param usabilityId
         * @param actuallyUsed
         * @returns
         */
        this.validateUsed = async (res, usabilityId, actuallyUsed) => {
            try {
                const usability = await this.modelUsability.findOneAndUpdate({
                    _id: usabilityId
                }, {
                    used: actuallyUsed
                }, {
                    new: true,
                });
                return usability;
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error updating usability ');
            }
        };
        /**
         * delete usabilities
         * @param { string } subscriptionId
         */
        this.deleteUsabilities = async (subscriptionId) => {
            const usabilites = await this.modelUsability.deleteMany({ subscription_id: subscriptionId });
        };
        this.utils = new utils_1.Utils();
        this.planService = new plans_service_1.PlanService();
    }
}
exports.SubscriptionUsabilityService = SubscriptionUsabilityService;
