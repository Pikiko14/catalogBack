import { Response } from "express";
import { RequestExt } from '../interfaces/req-ext';
import { errorResponse } from "../utils/api.responser";
import { DashboardService } from "../services/dashboard.service";

export class DashboardController {
    service: DashboardService;

    constructor() {
        this.service = new DashboardService();
    }

    /**
     * List metrics
     * @param req
     * @param res
     * @returns
     */
    listMetrics = async (req: RequestExt, res: Response) => {
        try {
            const userId = req.user.parent || req.user._id;
            await this.service.listMetrics(res, userId);
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error listing metrics');
        }
    }
}
