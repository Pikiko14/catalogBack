"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils/utils");
const catalogues_model_1 = __importDefault(require("../models/catalogues.model"));
const api_responser_1 = require("../utils/api.responser");
const subscriptions_service_1 = require("./../services/subscriptions.service");
// instances
const utils = new utils_1.Utils();
const subscriptionService = new subscriptions_service_1.SubscriptionService();
// middleare permission
const validateCatalogActive = async (req, res, next) => {
    try {
        // validate if catalog is active
        const { id } = req.params;
        const catalog = await catalogues_model_1.default.findById(id);
        // validate if catalog is null
        if (catalog) {
            // valdiate if catalog is active
            if (!catalog.is_active) {
                return (0, api_responser_1.deniedResponse)(res, { error: 'not_active' }, "Catalog is not active.");
            }
            // valdiate if main user have any suscription active
            const subscription = await subscriptionService.getSubscription('user_id', catalog.user_id, false);
            if (!subscription) {
                return (0, api_responser_1.deniedResponse)(res, { no_subscription: true }, "The user owner of this catalogue does not have an active subscription.");
            }
            // validate if subscription is expired
            const now = utils.getDate();
            const expiredAtSubscription = utils.getDateFromString(subscription.date_end);
            if (subscription && expiredAtSubscription <= now) {
                const disable = await subscriptionService.disableSubscription(subscription.id);
                if (disable) {
                    return (0, api_responser_1.deniedResponse)(res, {}, "your subscription expired.");
                }
            }
        }
        // pass middleware
        next();
    }
    catch (error) {
        return (0, api_responser_1.deniedResponse)(res, {}, "Catalog is not active.");
    }
};
exports.default = validateCatalogActive;
