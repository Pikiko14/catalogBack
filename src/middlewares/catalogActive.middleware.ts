import { Utils } from "../utils/utils";
import { NextFunction, Response } from "express";
import { RequestExt } from "../interfaces/req-ext";
import CatalogueModel from "../models/catalogues.model";
import { deniedResponse, notFountResponse } from "../utils/api.responser";
import { SubscriptionService } from './../services/subscriptions.service';

// instances
const utils = new Utils();
const subscriptionService: SubscriptionService = new SubscriptionService();

// middleare permission
const validateCatalogActive = async (req: RequestExt, res: Response, next: NextFunction) => {
    try {
        // validate if catalog is active
        const { id } = req.params;
        const catalog = await CatalogueModel.findById(id);
        // validate if catalog is null
        if (!catalog) {
            return notFountResponse(res, id, 'Catalog id don´t found in our records');
        }
        // valdiate if catalog is active
        if (!catalog.is_active) {
            return deniedResponse(res, { error: 'not_active' }, "Catalog is not active.");
        }
        // valdiate if main user have any suscription active
        const subscription = await subscriptionService.getSubscription('user_id', catalog.user_id as any, false);
        if (!subscription) {
            return deniedResponse(res, {}, "The user owner of this catalogue does not have an active subscription.");
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
        // pass middleware
        next();
    } catch (error) {
        return deniedResponse(res, {}, "Catalog is not active.");
    }
};

export default validateCatalogActive;