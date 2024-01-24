import { Response, Request } from "express";
import { matchedData  } from "express-validator"; 
import { errorResponse } from "../utils/api.responser";
import { PagesService } from "../services/pages.service";
import { PagesInterface } from "../interfaces/pages.interface";
import { PagesCountDecorator } from "../decorators/pages-quantity.decorator";
import { PagesImportDecorator } from "../decorators/pages-import.decorator";


export class PagesController {
    service: PagesService;

    constructor() {
        this.service = new PagesService();
        this.createPages = this.createPages.bind(this);
        this.importPages = this.importPages.bind(this);
        this.setButtonOnpage = this.setButtonOnpage.bind(this);
    }

    /**
     * List catalogue pages
     * @param {Request} req
     * @param {Response} res
     */
    listPages = async (req: Request | any, res: Response): Promise<void> => {
        try {
            const { id } = req.params; // get catalogue id
            const { page, perPage } = req.query;
            await this.service.listPages(res, id, page, perPage);
        } catch (error) {
            return errorResponse(res, error, 'Error listing catalogue pages.');
        }
    }

    /**
     * Create catalogue pages
     * @param {Request} req
     * @param {Response} res
     */
    @PagesCountDecorator
    public async createPages (req: Request, res: Response): Promise<void> {
        try {
            const files: any = req.files;
            const body = matchedData(req) as PagesInterface; // get clean body data
            await this.service.createPage(res, body, files);
        } catch (error) {
            return errorResponse(res, error, 'Error creating catalogue pages.');
        }
    };

    /**
     * Show catalogue pages
     * @param {Request} req
     * @param {Response} res
     */
    showPages = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params; // get id in params
            await this.service.showPage(res, id);
        } catch (error) {
            return errorResponse(res, error, 'Error listing catalogue pages.');
        }
    }

    /**
     * Delete catalogue page
     * @param {Request} req
     * @param {Response} res
     */
    deletePages = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params; // get id in params
            await this.service.deletePages(res, id);
        } catch (error) {
            return errorResponse(res, error, 'Error listing catalogue pages.');
        }
    }

    /**
     * import catalogue page
     * @param {Request} req
     * @param {Response} res
     */
    @PagesImportDecorator
    public async importPages (req: Request, res: Response): Promise<void> {
        try {
            const body = matchedData(req); 
            await this.service.importPages(res, body, req.file);
        } catch (error) {
            return errorResponse(res, error, 'Error on import catalogue pages.');
        }
    }

    /**
     * set buttons on page
     * @param {Request} req
     * @param {Response} res
     */
    public async setButtonOnpage (req: Request, res: Response): Promise<void> {
        try {
            const { body } = req;
            const { id } = req.params;
            await this.service.setButtonOnpage(res, body, id);
        } catch (error) {
            return errorResponse(res, error, 'Error set button on catalogue pages.');
        }
    }
}