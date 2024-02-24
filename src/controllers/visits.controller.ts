import { Response, Request } from "express";
import { matchedData } from "express-validator";
import { VisitsService } from "../services/visits.service";
import { VisitsInterface } from "../interfaces/visits.interface";
import { unProcesableEntityResponse } from "../utils/api.responser";
import { CatalogueService } from "../services/catalogues.service";

export class VisitsController {
    service: VisitsService

    constructor() {
        this.service = new VisitsService();
    }

    /**
     * create order
     * @param { RequestExt } req
     * @param { Response } res
     * @return { Promise }
     */
    createVisit = async (req: Request, res: Response): Promise<void | Response> => {
        try {
            const body = matchedData(req) as VisitsInterface;
            await this.service.createVisit(res, body);
        } catch (error: any) {
            return unProcesableEntityResponse(res, error, error.message)
        }
    }
}