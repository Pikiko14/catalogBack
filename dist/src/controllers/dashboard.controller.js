"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const api_responser_1 = require("../utils/api.responser");
const dashboard_service_1 = require("../services/dashboard.service");
class DashboardController {
    constructor() {
        /**
         * List metrics
         * @param req
         * @param res
         * @returns
         */
        this.listMetrics = async (req, res) => {
            try {
                const userId = req.user.parent || req.user._id;
                await this.service.listMetrics(res, userId);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error.message, 'Error listing metrics');
            }
        };
        this.service = new dashboard_service_1.DashboardService();
    }
}
exports.DashboardController = DashboardController;
