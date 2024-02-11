import { Response, Request } from "express";
import { matchedData } from "express-validator";
import { OrdersService } from "../services/orders.service";
import { OrderInterface } from "../interfaces/orders.interface";
import { unProcesableEntityResponse } from "../utils/api.responser";

export class OrdersController {
    service: OrdersService

    constructor() {
        this.service = new OrdersService();
    }

    /**
     * create order
     * @param { RequestExt } req
     * @param { Response } res
     * @return { Promise }
     */
    createOrder = async (req: Request, res: Response): Promise<void | Response> => {
        try {
            const body = matchedData(req) as OrderInterface;
            await this.service.createOrder(res, body, '');
        } catch (error: any) {
            return unProcesableEntityResponse(res, error, error.message)
        }
    }
}