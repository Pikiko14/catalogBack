"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitsController = void 0;
const express_validator_1 = require("express-validator");
const visits_service_1 = require("../services/visits.service");
const api_responser_1 = require("../utils/api.responser");
class VisitsController {
    constructor() {
        /**
         * create order
         * @param { RequestExt } req
         * @param { Response } res
         * @return { Promise }
         */
        this.createVisit = async (req, res) => {
            try {
                const body = (0, express_validator_1.matchedData)(req);
                await this.service.createVisit(res, body);
            }
            catch (error) {
                return (0, api_responser_1.unProcesableEntityResponse)(res, error, error.message);
            }
        };
        this.service = new visits_service_1.VisitsService();
    }
}
exports.VisitsController = VisitsController;
