import { Response } from "express";
import VisitModel from "../models/visits.model";
import { successResponse } from "../utils/api.responser";
import { VisitsInterface } from './../interfaces/visits.interface';
import { CatalogueService } from "./catalogues.service";
import { Catalogue } from "../interfaces/catalogues.interface";

export class VisitsService {
    model: any = VisitModel;
    catalogueService: CatalogueService;

    constructor() {
        this.catalogueService = new CatalogueService();
    }

    /**
     * Create order
     * @param { Response } res
     * @param { OrderInterface } body
     * @param { string } userId
     */
    createVisit = async (res: Response, body: VisitsInterface) => {
        try {
            // get catalogue data
            const catalogue = await this.catalogueService.findById(body.catalogue_id as any) as Catalogue;
            if (catalogue) {
                body.user_id = catalogue.user_id.toString();
            }
            // create visit
            const visit = await this.model.create(body);
            return successResponse(res, visit, 'Visit loaded success');
        } catch (error) {
            throw error;
        }
    }
}