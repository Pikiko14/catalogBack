"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagesImportDecorator = void 0;
const fs = __importStar(require("fs"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const api_responser_1 = require("../utils/api.responser");
const utils_1 = require("../utils/utils");
const catalogues_service_1 = require("../services/catalogues.service");
const users_service_1 = require("../services/users.service.");
const subscription_usability_service_1 = require("../services/subscription-usability.service");
const subscriptions_service_1 = require("../services/subscriptions.service");
// instances
const utils = new utils_1.Utils();
const userService = new users_service_1.UserService();
const catalogService = new catalogues_service_1.CatalogueService();
const subscriptionService = new subscriptions_service_1.SubscriptionService();
const subscriptionUsabilityService = new subscription_usability_service_1.SubscriptionUsabilityService();
function PagesImportDecorator(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (req, res) {
        // do some validations
        const file = req.file;
        // get catalogue
        const catalog = await catalogService.findById(req.body.catalogId);
        if (!catalog) {
            await removeItem(file.filename);
            return (0, api_responser_1.notFountResponse)(res, req.body.catalogue_id, 'Catalog id don`t exists.');
        }
        const totalPage = catalog.pages.length;
        // validamos la subscripcion y la usabilidad
        // get user
        const user = await userService.getUserById(catalog.user_id);
        if (!user) {
            await removeItem(file.filename);
            return (0, api_responser_1.notFountResponse)(res, req.body.user_id, 'User id don`t exists.');
        }
        // obtenemos la subscripcion del cliente
        const subscription = await subscriptionService.getSubscription('user_id', user.id);
        if (!subscription) {
            await removeItem(file.filename);
            return (0, api_responser_1.notFountResponse)(res, req.body.user_id, 'User don`t have active subscription.');
        }
        // get usabilities
        let path = req.baseUrl.split('/api/v1/').pop();
        let method = req.method;
        const existsAbility = await subscriptionUsabilityService.hasAbility(subscription.id, path, method);
        if (!existsAbility) {
            await removeItem(file.filename);
            return (0, api_responser_1.deniedResponse)(res, {}, "Your plan does not have access to this functionality.");
        }
        // obtenemos el total de paginas del pdf;
        const dataBuffer = fs.readFileSync(file.path);
        const data = await (0, pdf_parse_1.default)(dataBuffer);
        const totalPagesInUse = totalPage + data.numpages;
        if (totalPagesInUse > existsAbility.total) {
            await removeItem(file.filename);
            return (0, api_responser_1.deniedResponse)(res, null, `Your catalog has a total of ${totalPage} pages, the PDF you are trying to export has a total of ${data.numpages} pages, the sum of the PDF plus the current pages of the catalog exceeds the total pages available for your plan for each catalog.`);
        }
        // if validator pass call original methods
        await originalMethod.call(this, req, res);
    };
}
exports.PagesImportDecorator = PagesImportDecorator;
async function removeItem(path) {
    await utils.deleteItemFromStorage(`pdfs/${path}`);
}
