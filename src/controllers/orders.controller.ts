import { Response, Request } from "express";
import { successResponse } from "../utils/api.responser";

export class OrdersController {
    constructor() {
    }

    /**
     * create order
     * @param { Request } req
     * @param { Response } res
     * @return { Promise }
     */
    public createOrder(req: Request, res: Response): void | Response {
        return successResponse(res, 1, 'listado');
    }
}