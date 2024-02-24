"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitsService = void 0;
const visits_model_1 = __importDefault(require("../models/visits.model"));
const api_responser_1 = require("../utils/api.responser");
const catalogues_service_1 = require("./catalogues.service");
class VisitsService {
    constructor() {
        this.model = visits_model_1.default;
        /**
         * Create order
         * @param { Response } res
         * @param { OrderInterface } body
         * @param { string } userId
         */
        this.createVisit = async (res, body) => {
            try {
                // get catalogue data
                const catalogue = await this.catalogueService.findById(body.catalogue_id);
                if (catalogue) {
                    body.user_id = catalogue.user_id.toString();
                }
                // create visit
                const visit = await this.model.create(body);
                return (0, api_responser_1.successResponse)(res, visit, 'Visit loaded success');
            }
            catch (error) {
                throw error;
            }
        };
        this.catalogueService = new catalogues_service_1.CatalogueService();
    }
}
exports.VisitsService = VisitsService;
