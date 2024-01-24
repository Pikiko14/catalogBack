"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanController = void 0;
const api_responser_1 = require("../utils/api.responser");
const plans_service_1 = require("../services/plans.service");
const express_validator_1 = require("express-validator");
class PlanController {
    constructor() {
        /**
         * Creamos los planes
         * @param req
         * @param res
         * @returns
         */
        this.createPlan = async (req, res) => {
            try {
                const body = (0, express_validator_1.matchedData)(req);
                await this.service.createPlan(res, body);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error show catalogues');
            }
        };
        /**
         * List plans
         * @param req
         * @param res
         * @returns
         */
        this.listPlans = async (req, res) => {
            try {
                await this.service.listPlans(res);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error show catalogues');
            }
        };
        /**
         * Show plan
         * @param req
         * @param res
         * @returns
         */
        this.showPlan = async (req, res) => {
            try {
                const { id } = req.params;
                await this.service.showPlan(res, id);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error show catalogues');
            }
        };
        /**
         * Update plan
         * @param req
         * @param res
         * @returns
         */
        this.updatePlan = async (req, res) => {
            try {
                const { id } = req.params;
                const body = (0, express_validator_1.matchedData)(req);
                await this.service.updatePlan(res, id, body);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error show catalogues');
            }
        };
        /**
         * Delete plan
         * @param req
         * @param res
         * @returns
         */
        this.deletePlan = async (req, res) => {
            try {
                const { id } = req.params;
                await this.service.deletePlan(res, id);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error show catalogues');
            }
        };
        this.service = new plans_service_1.PlanService();
    }
}
exports.PlanController = PlanController;
