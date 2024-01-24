"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagesCountDecorator = void 0;
const users_service_1 = require("../services/users.service.");
const api_responser_1 = require("../utils/api.responser");
const catalogues_service_1 = require("../services/catalogues.service");
const subscriptions_service_1 = require("../services/subscriptions.service");
const subscription_usability_service_1 = require("../services/subscription-usability.service");
const utils_1 = require("../utils/utils");
// instance of services
const utils = new utils_1.Utils();
const userService = new users_service_1.UserService();
const catalogService = new catalogues_service_1.CatalogueService();
const subscriptionService = new subscriptions_service_1.SubscriptionService();
const subscriptionUsabilityService = new subscription_usability_service_1.SubscriptionUsabilityService();
// prepare decorator
function PagesCountDecorator(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (req, res) {
        // get catalogue
        const catalog = await catalogService.findById(req.body.catalogue_id);
        if (!catalog) {
            return (0, api_responser_1.notFountResponse)(res, req.body.catalogue_id, 'Catalog id don`t exists.');
        }
        // get user
        const user = await userService.getUserById(catalog.user_id);
        if (!user) {
            return (0, api_responser_1.notFountResponse)(res, req.body.user_id, 'User id don`t exists.');
        }
        // obtenemos la subscripcion del cliente
        const subscription = await subscriptionService.getSubscription('user_id', user.id);
        if (!subscription) {
            return (0, api_responser_1.notFountResponse)(res, req.body.user_id, 'User don`t have active subscription.');
        }
        // get usabilities
        let path = req.baseUrl.split('/api/v1/').pop();
        if (req.method !== 'DELETE' && req.url !== '/') {
            path += req.url;
        }
        let method = req.method;
        const existsAbility = await subscriptionUsabilityService.hasAbility(subscription.id, path, method);
        if (!existsAbility) {
            return (0, api_responser_1.deniedResponse)(res, {}, "Your plan does not have access to this functionality.");
        }
        if (existsAbility.type_characteristics && catalog.pages.length === existsAbility.total) {
            // eliminamos los archivos previamente subidos
            const files = req.files;
            if (req.files) {
                for (const file of files) {
                    await utils.deleteItemFromStorage(`images/${file.filename}`);
                }
            }
            // return message
            return (0, api_responser_1.deniedResponse)(res, null, `You cannot create more pages for this catalog, your plan only allows you to have ${existsAbility.total} pages per catalog.`);
        }
        // if validator pass call original methods
        await originalMethod.call(this, req, res);
    };
    return descriptor;
}
exports.PagesCountDecorator = PagesCountDecorator;
