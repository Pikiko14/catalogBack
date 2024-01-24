import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { errorResponse } from "../utils/api.responser";
import { SubscriptionService } from "../services/subscriptions.service";
import { SubscriptionsInterface } from "../interfaces/subscriptions.interface";
import { RequestExt } from "../interfaces/req-ext";

export class SubscriptionController {
    service: SubscriptionService;

    constructor() {
        this.service = new SubscriptionService();
    }

    /**
     * Create new subscription
     * @param req
     * @param res
     * @returns 
     */
    createSubscription = async (req: RequestExt, res: Response): Promise<void> => {
        try {
            const { user } = req;
            const body: SubscriptionsInterface = matchedData(req) as SubscriptionsInterface;
            await this.service.createSubscription(res, body, user);
        } catch (error) {
            return errorResponse(res, error, 'Error creating subscription');
        }
    }

    /**
     * Cancel subscription
     * @param req 
     * @param res
     * @returns  
     */
    cancelSubscription = async (req: RequestExt, res: Response): Promise<any> => {
        try {
            const { user } = req;
            const { id } = req.params;
            await this.service.cancelSubscription(res, id, user);
        } catch (error) {
            return errorResponse(res, error, 'Error creating subscription');
        }
    }

    /**
     * epayco confirmation
     * @param req 
     * @param res
     * @returns  
     */
    confirmationEpayco = async (req: RequestExt, res: Response): Promise<any> => {
        try {
            console.log('confirmation Epayco');
            console.log(req.body);
            await this.service.confirmationEpayco(res, req.body);
        } catch (error) {
            return errorResponse(res, error, 'Error creating subscription');
        }
    }

    /**
     * epayco response
     * @param req 
     * @param res
     * @returns  
     */
    responseEpayco = async (req: RequestExt, res: Response): Promise<any> => {
        try {
            const { ref_payco } = req.query;
            await this.service.responseEpayco(res, ref_payco);
        } catch (error) {
            return errorResponse(res, error, 'Error creating subscription');
        }
    }
}