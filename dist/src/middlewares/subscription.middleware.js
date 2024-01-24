"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils/utils");
const api_responser_1 = require("../utils/api.responser");
const subscriptions_service_1 = require("./../services/subscriptions.service");
const subscription_usability_service_1 = require("./../services/subscription-usability.service");
// instances
const utils = new utils_1.Utils();
const subscriptionService = new subscriptions_service_1.SubscriptionService();
const subscriptionUsabilityService = new subscription_usability_service_1.SubscriptionUsabilityService();
const subscriptionCheck = async (req, res, next) => {
    try {
        // get user id of request
        const userId = req.user && req.user.parent ? req.user.parent : req.user._id;
        // get if have suscription active
        const subscription = await subscriptionService.getSubscription('user_id', userId, false);
        if (!subscription) {
            return (0, api_responser_1.deniedResponse)(res, {}, "The user does not have an active subscription.");
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
        // proceded to validate usability
        let path = req.baseUrl.split('/api/v1/').pop();
        let method = req.method;
        if (method === 'DELETE') {
            method = 'POST';
        }
        if (req.method !== 'DELETE' && req.url !== '/') {
            path += req.url;
        }
        // validamos si la suscripcion posee esta usabilidad si no
        const existsAbility = await subscriptionUsabilityService.hasAbility(subscription.id, path, method);
        if (!existsAbility) {
            return (0, api_responser_1.deniedResponse)(res, {}, "Your plan does not have access to this functionality.");
        }
        // validate if is boolean type
        if (req.method === 'POST' &&
            existsAbility &&
            existsAbility.type_characteristics === 'boolean' &&
            existsAbility.used === 0) {
            return (0, api_responser_1.deniedResponse)(res, {}, "Your plan does not have access to this functionality.");
        }
        // delete usability
        if (req.method === 'DELETE' &&
            existsAbility.type_characteristics === 'quantity' &&
            !existsAbility.path.includes('pages') &&
            existsAbility &&
            existsAbility.used > 0) {
            await subscriptionUsabilityService.validateUsed(res, existsAbility.id, existsAbility.used - 1);
        }
        // validamos la usabilidad esta disponible
        if (req.method !== 'DELETE' &&
            existsAbility &&
            existsAbility.type_characteristics === 'quantity' &&
            existsAbility.used >= existsAbility.total) {
            return (0, api_responser_1.deniedResponse)(res, {}, "You cannot make further use of this feature.");
        }
        // up usability
        let usability = null;
        if (req.method === 'POST' &&
            existsAbility &&
            existsAbility.type_characteristics === 'quantity' &&
            !existsAbility.path.includes('pages') &&
            existsAbility.used < existsAbility.total) {
            usability = await subscriptionUsabilityService.validateUsed(res, existsAbility.id, existsAbility.used + 1);
        }
        req.ability = existsAbility;
        // request pass success
        next();
    }
    catch (e) {
        return (0, api_responser_1.deniedResponse)(res, {}, "Error validating subscription active.");
    }
};
exports.default = subscriptionCheck;
