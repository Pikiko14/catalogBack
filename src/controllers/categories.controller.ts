import { Response, Request } from "express";
import { body, matchedData } from "express-validator";
import { errorResponse, successResponse } from "../utils/api.responser";
import { CategoriesService } from "../services/categories.service";
import { RequestExt } from './../interfaces/req-ext';
import { CategoryInterface } from './../interfaces/categories.interface';

export class CategoriesController {
    service: CategoriesService;

    constructor() {
        this.service = new CategoriesService();
    }

    /**
     * Create categories
     * @param req
     * @param res
     * @returns
     */
    createCategories = async (req: RequestExt, res: Response) => {
        try {
            const { user } = req;
            const file: any = req.file;
            const body: CategoryInterface | any = matchedData(req);
            await this.service.createCategories(res, { user, body, file });
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error create categories');
        }
    }

    /**
     * List categories
     * @param req
     * @param res
     * @returns
     */
    listCategories = async (req: RequestExt, res: Response) => {
        try {
            const { page, perPage, search } = req.query;
            const userId = req.user.parent || req.user._id;
            await this.service.listCategories(res, userId, { page, perPage, search });
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error create categories');
        }
    }

     /**
     * Update categories
     * @param req
     * @param res
     * @returns
     */
     updateCategories = async (req: RequestExt, res: Response) => {
        try {
            const { id } = req.params;
            const file: any = req.file;
            const body: CategoryInterface = matchedData(req) as any;
            await this.service.updateCategories(res, id, body, file);
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error create categories');
        }
    }

    /**
     * Delete categories
     * @param req
     * @param res
     * @returns
     */
    deleteCategories = async (req: RequestExt, res: Response) => {
        try {
            const { id } = req.params;
            await this.service.deleteCategories(res, id);
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error create categories');
        }
    }
}
