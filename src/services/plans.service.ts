import { Response } from "express";
import { Utils } from "../utils/utils";
import PlanModel from '../models/plan.model';
import { errorResponse, notFountResponse, successResponse } from "../utils/api.responser";
import { PlanInterface } from "../interfaces/plan.interface";

export class PlanService {
    utils: Utils;
    model: any = PlanModel;
    freePlanName: string = 'free_plan';

    constructor(
    ) {
        this.utils = new Utils();
    }

    /**
     * create plan
     * @param {*} res
     * @param {*} body
     */
    createPlan = async(res: Response, body: PlanInterface): Promise<any> => {
        try {
            // create plan on bbdd
            const plan: PlanInterface = await this.model.create(body);
            return successResponse(res, plan, 'Plan created success');
        } catch (error) {
            return errorResponse(res, error, 'Error creating plan');
        }
    }

    /**
     * create plan
     * @param {*} res
     * @param {*} body
     */
    listPlans = async (res: Response): Promise<any> => {
        try {
            // create plan on bbdd
            const plan: PlanInterface[] = await this.model.find();
            return successResponse(res, plan, 'Plan list');
        } catch (error) {
            return errorResponse(res, error, 'Error list plans');
        }
    }

    /**
     * Show plan
     * @param res
     * @param id
     * @returns
     */
    showPlan = async (res: Response, id: string): Promise<void> => {
        try {
            const plan: PlanInterface[] = await this.model.findById(id);
            if (!plan) {
                return notFountResponse(res, null, 'Plan don´t exists')
            }
            return successResponse(res, plan, 'Plan data');
        } catch (error) {
            return errorResponse(res, error, 'Error show plans');
        }
    }

    /**
     * validate id plan
     * @param id
     */
    findById = async (id: string): Promise<boolean> => {
        const plan: PlanInterface = await this.model.findById(id);
        if (plan) {
            return true;
        }
        return false;
    }

    /**
     * Update plan
     * @param res 
     * @param id 
     * @param body 
     */
    updatePlan = async (res: Response, id: string, body: PlanInterface): Promise<void> => {
        try {
            // update plan on bbdd
            const plan: PlanInterface = await this.model.findOneAndUpdate(
                { _id: id },
                body,
                {
                    new: true,
                }
            );
            return successResponse(res, plan, 'Update Plan data');
        } catch (error) {
            return errorResponse(res, error, 'Error show plans');
        }
    }

    /**
     * Delete plan data
     * @param res
     * @param id
     * @returns
     */
    deletePlan = async (res: Response, id: string): Promise<void> => {
        try {
            // dekete plan on bbdd
            const plan: PlanInterface[] = await this.model.findOneAndDelete({ _id: id });
            if (!plan) {
                return notFountResponse(res, null, 'Plan don´t exists')
            }
            return successResponse(res, plan, 'Delete plan data');
        } catch (error) {
            return errorResponse(res, error, 'Error deleting plans');
        }
    }

    /**
     * Filter subscriptions by key and value
     * @param { string } key
     * @param { any } value
     * @returns { Promise<PlanInterface | null> }
     */
    getPlan = async (
        key: keyof PlanInterface,
        value: string,
    ): Promise<PlanInterface | null> => {
        try {
            const query: any = {
                [key]: value,
                expired_at : null
            }
            const plan: PlanInterface | null = await this.model.findOne(query);
            return plan;
        } catch (error) {
            throw error;
        }
    };

    /**
     * get free plan
     */
    getFreePlan = async () => {
        try {
            const freePlan = await this.model.findOne({ name: this.freePlanName });
            if (freePlan) {
                return freePlan;
            }
            return null;
        } catch (error) {
            throw error;
        }
    }
}