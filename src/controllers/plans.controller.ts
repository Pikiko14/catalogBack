import { Request, Response } from "express";
import { errorResponse } from "../utils/api.responser";
import { PlanService } from "../services/plans.service";
import { matchedData } from "express-validator";
import { PlanInterface } from "../interfaces/plan.interface";

export class PlanController {
    service: PlanService;

    constructor() {
        this.service = new PlanService();
    }

    /**
     * Creamos los planes
     * @param req
     * @param res
     * @returns
     */
    createPlan = async(req: Request, res: Response): Promise<void> => {
        try {
            const body = matchedData(req) as PlanInterface;
            await this.service.createPlan(res, body);
        } catch (error) {
            return errorResponse(res, error, 'Error show catalogues');
        }
    }

    /**
     * List plans
     * @param req
     * @param res
     * @returns
     */
    listPlans = async(req: Request, res: Response): Promise<void> => {
        try {
            await this.service.listPlans(res);
        } catch (error) {
            return errorResponse(res, error, 'Error show catalogues');
        }
    }

    /**
     * Show plan
     * @param req 
     * @param res 
     * @returns 
     */
    showPlan = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this.service.showPlan(res, id);
        } catch (error) {
            return errorResponse(res, error, 'Error show catalogues');
        }
    }
    
    /**
     * Update plan
     * @param req
     * @param res
     * @returns
     */
    updatePlan = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const body = matchedData(req) as PlanInterface;
            await this.service.updatePlan(res, id, body);
        } catch (error) {
            return errorResponse(res, error, 'Error show catalogues');
        }
    }

    /**
     * Delete plan
     * @param req
     * @param res
     * @returns
     */
    deletePlan = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this.service.deletePlan(res, id);
        } catch (error) {
            return errorResponse(res, error, 'Error show catalogues');
        }
    }
}