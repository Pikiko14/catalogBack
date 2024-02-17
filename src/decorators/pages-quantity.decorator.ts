import { Request, Response } from 'express';
import { RequestExt } from '../interfaces/req-ext';
import { UserService } from '../services/users.service';
import { deniedResponse, notFountResponse } from '../utils/api.responser';
import { Catalogue } from '../interfaces/catalogues.interface';
import { CatalogueService } from '../services/catalogues.service';
import { SubscriptionService } from '../services/subscriptions.service';
import { SubscriptionUsabilityService } from '../services/subscription-usability.service';
import { SubscriptionUsabilityInterface } from '../interfaces/SubscriptionUsability.interface';
import { Utils } from '../utils/utils';

// instance of services
const utils: Utils = new Utils();
const userService = new UserService();
const catalogService = new CatalogueService();
const subscriptionService = new SubscriptionService();
const subscriptionUsabilityService: SubscriptionUsabilityService = new SubscriptionUsabilityService();

// prepare decorator
export function PagesCountDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (req: RequestExt, res: Response): Promise<any> {
        // get catalogue
        const catalog: Catalogue | any = await catalogService.findById(req.body.catalogue_id) as any;
        if (!catalog) {
            return notFountResponse(res, req.body.catalogue_id, 'Catalog id don`t exists.');
        }
        // get user
        const user: any = await userService.getUserById(catalog.user_id);
        if (!user) {
            return notFountResponse(res, req.body.user_id, 'User id don`t exists.');
        }
        // obtenemos la subscripcion del cliente
        const subscription= await subscriptionService.getSubscription('user_id', user.id);
        if (!subscription) {
            return notFountResponse(res, req.body.user_id, 'User don`t have active subscription.');
        }
        // get usabilities
        let path: string = req.baseUrl.split('/api/v1/').pop() as string;
        if (req.method !== 'DELETE' && req.url !== '/') {
            path += req.url;
        }
        let method = req.method;
        const existsAbility: SubscriptionUsabilityInterface | any = await subscriptionUsabilityService.hasAbility(subscription.id, path, method);
        if (!existsAbility) {
            return deniedResponse(
                res,
                {},
                "Your plan does not have access to this functionality."
            );
        }
        if (existsAbility.type_characteristics && catalog.pages.length === existsAbility.total) {
            // eliminamos los archivos previamente subidos
            const files = req.files as any;
            if (req.files) {
                for (const file of files) {
                    await utils.deleteItemFromStorage(`images/${file.filename}`);
                }
            }
            // return message
            return deniedResponse(
                res,
                null,
                `You cannot create more pages for this catalog, your plan only allows you to have ${existsAbility.total} pages per catalog.`
            );
        }
        // if validator pass call original methods
        await (originalMethod.call(this, req, res) as Promise<void>);
    };
    return descriptor;
}