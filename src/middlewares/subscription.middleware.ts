import { Utils } from "../utils/utils";
import { RequestExt } from "../interfaces/req-ext";
import { NextFunction, Request, Response } from "express";
import { deniedResponse } from "../utils/api.responser";
import { SubscriptionService } from './../services/subscriptions.service';
import { SubscriptionUsabilityService } from './../services/subscription-usability.service';
import { SubscriptionUsabilityInterface } from "../interfaces/SubscriptionUsability.interface";

// instances
const utils = new Utils();
const subscriptionService: SubscriptionService = new SubscriptionService();
const subscriptionUsabilityService: SubscriptionUsabilityService = new SubscriptionUsabilityService();

const subscriptionCheck = async (req: RequestExt, res: Response, next: NextFunction) => {
    try {
        // get user id of request
        const userId = req.user && req.user.parent ? req.user.parent : req.user._id;
        // get if have suscription active
        const subscription = await subscriptionService.getSubscription('user_id', userId, false);
        if (!subscription) {
            return deniedResponse(res, {}, "The user does not have an active subscription.");
        }
        // validate if subscription is expired
        const now = utils.getDate();
        const expiredAtSubscription = utils.getDateFromString(subscription.date_end as Date);
        if (subscription && expiredAtSubscription <= now) {
            const disable = await subscriptionService.disableSubscription(subscription.id as string);
            if (disable) {
                return deniedResponse(res, {}, "your subscription expired.");
            }
        }
        // proceded to validate usability
        let path: string = req.baseUrl.split('/api/v1/').pop() as string;
        let method = req.method;
        if (method === 'DELETE') {
            method = 'POST'
        }
        if (req.method !== 'DELETE' && req.url !== '/') {
            path += req.url;
        }
        // validamos si la suscripcion posee esta usabilidad si no
        const existsAbility: SubscriptionUsabilityInterface | any = await subscriptionUsabilityService.hasAbility(subscription.id, path, method);
        if (!existsAbility) {
            return deniedResponse(res, {}, "Your plan does not have access to this functionality.");
        }
        // validate if is boolean type
        if (
            req.method === 'POST' &&
            existsAbility &&
            existsAbility.type_characteristics === 'boolean' &&
            existsAbility.used === 0
        ) {
            return deniedResponse(res, {}, "Your plan does not have access to this functionality.");
        }
        // delete usability
        if (
            req.method === 'DELETE' &&
            existsAbility.type_characteristics === 'quantity' &&
            !existsAbility.path.includes('pages') &&
            existsAbility &&
            existsAbility.used > 0
        ) {
            await subscriptionUsabilityService.validateUsed(res, existsAbility.id, existsAbility.used - 1);
        }
        // validamos la usabilidad esta disponible
        if (
            req.method !== 'DELETE' &&
            existsAbility &&
            existsAbility.type_characteristics === 'quantity' &&
            existsAbility.used >= existsAbility.total
        ) {
            return deniedResponse(res, {}, "You cannot make further use of this feature.");
        }
        // up usability
        let usability = null;
        if (
            req.method === 'POST' &&
            existsAbility &&
            existsAbility.type_characteristics === 'quantity' &&
            !existsAbility.path.includes('pages') &&
            existsAbility.used < existsAbility.total
        ) {
            usability = await subscriptionUsabilityService.validateUsed(res, existsAbility.id, existsAbility.used + 1);
        }
        req.ability = existsAbility;
        // request pass success
        next();
    } catch (e) {
        return deniedResponse(res, {}, "Error validating subscription active.");
    }
};

export default subscriptionCheck;