"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanService = void 0;
const utils_1 = require("../utils/utils");
const plan_model_1 = __importDefault(require("../models/plan.model"));
const api_responser_1 = require("../utils/api.responser");
class PlanService {
    constructor() {
        this.model = plan_model_1.default;
        /**
         * create plan
         * @param {*} res
         * @param {*} body
         */
        this.createPlan = async (res, body) => {
            try {
                // create plan on bbdd
                const plan = await this.model.create(body);
                return (0, api_responser_1.successResponse)(res, plan, 'Plan created success');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error creating plan');
            }
        };
        /**
         * create plan
         * @param {*} res
         * @param {*} body
         */
        this.listPlans = async (res) => {
            try {
                // create plan on bbdd
                const plan = await this.model.find();
                return (0, api_responser_1.successResponse)(res, plan, 'Plan list');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error list plans');
            }
        };
        /**
         * Show plan
         * @param res
         * @param id
         * @returns
         */
        this.showPlan = async (res, id) => {
            try {
                const plan = await this.model.findById(id);
                if (!plan) {
                    return (0, api_responser_1.notFountResponse)(res, null, 'Plan don´t exists');
                }
                return (0, api_responser_1.successResponse)(res, plan, 'Plan data');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error show plans');
            }
        };
        /**
         * validate id plan
         * @param id
         */
        this.findById = async (id) => {
            const plan = await this.model.findById(id);
            if (plan) {
                return true;
            }
            return false;
        };
        /**
         * Update plan
         * @param res
         * @param id
         * @param body
         */
        this.updatePlan = async (res, id, body) => {
            try {
                // update plan on bbdd
                const plan = await this.model.findOneAndUpdate({ _id: id }, body, {
                    new: true,
                });
                return (0, api_responser_1.successResponse)(res, plan, 'Update Plan data');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error show plans');
            }
        };
        /**
         * Delete plan data
         * @param res
         * @param id
         * @returns
         */
        this.deletePlan = async (res, id) => {
            try {
                // dekete plan on bbdd
                const plan = await this.model.findOneAndDelete({ _id: id });
                if (!plan) {
                    return (0, api_responser_1.notFountResponse)(res, null, 'Plan don´t exists');
                }
                return (0, api_responser_1.successResponse)(res, plan, 'Delete plan data');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error deleting plans');
            }
        };
        /**
         * Filter subscriptions by key and value
         * @param { string } key
         * @param { any } value
         * @returns { Promise<PlanInterface | null> }
         */
        this.getPlan = async (key, value) => {
            try {
                const query = {
                    [key]: value,
                    expired_at: null
                };
                const plan = await this.model.findOne(query);
                return plan;
            }
            catch (error) {
                throw error;
            }
        };
        this.utils = new utils_1.Utils();
    }
}
exports.PlanService = PlanService;
