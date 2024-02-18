import { Response, Request } from "express";
import { matchedData  } from "express-validator"; 
import { errorResponse } from "../utils/api.responser";
import { Catalogue } from "../interfaces/catalogues.interface";
import { CatalogueService } from "../services/catalogues.service";
import { RequestExt } from "../interfaces/req-ext";


export class CatalogueController {
    service: CatalogueService;
    publicPath: string;

    constructor() {
        this.service = new CatalogueService();
        this.publicPath = 'catalogues'
    }

    /**
     * List catalogue by user
     * @param {Request} req
     * @param {Response} res
     */
    listCatalogues = async (req: Request | any, res: Response) => {
        try {
            const { _id, parent } = req.user; // get user login id.
            const { page, perPage, search } = req.query; // get pagination data
            await this.service.listCatalogues(
                res,
                parent ? parent : _id,
                page,
                perPage,
                search,
            ); // list catalogues.
        } catch (error) {
            return errorResponse(res, error, 'Error listing catalogues.');
        }
    }

    /**
     * Create catalogue
     * @param {Request} req
     * @param {Response} res
     */
    createCatalogue = async (req: Request | any, res: Response) => {
        try {
            const body = matchedData(req) as Catalogue; // get body clean
            body.cover = `/${this.publicPath}/${req.file.filename}`;
            const { _id, parent } = req.user; // get user loged id
            body.user_id = parent ? parent : _id; // set  main user id
            await this.service.createCatalogue(res, body);
        } catch (error) {
            return errorResponse(res, error, 'Error creating catalogues.');
        }
    }

    /**
     * Show catalogue
     * @param {Request} req
     * @param {Response} res
     */
    showCatalogue = async (req: Request, res: Response) => {
        try {
            const { id } = req.params; // get id param in request
            await this.service.showCatalogue(res, id);
        } catch (error) {
            return errorResponse(res, error, 'Error show catalogue');
        }
    }

    /**
     * Show catalogue
     * @param {Request} req
     * @param {Response} res
     */
     updateCatalogue = async (req: Request | any, res: Response) => {
        try {
            const body = matchedData(req) as Catalogue; // get body clean
            if (req.file) { 
                body.cover = `/${this.publicPath}/${req.file.filename}`;
            }
            const { id } = req.params; // get id param in request
            await this.service.updateCatalogue(res, body);
        } catch (error) {
            return errorResponse(res, error, 'Error on update catalogue');
        }
    }
    
    /**
     * Show catalogue
     * @param {Request} req
     * @param {Response} res
     */
    deleteCatalogue = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this.service.deleteCatalogue(res, id);
        } catch (error) {
            return errorResponse(res, error, 'Error on delete catalogue');
        }
    }

    /**
     * do activation catalogs
     * @param {Request} req
     * @param {Response} res
     */
    doActivateCatalog = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this.service.doActivateCatalog(res, id);
        } catch (error) {
            return errorResponse(res, error, 'Error on activation of catalogue');
        }
    }

    /**
     * List catalog by id
     * @param {Request} req
     * @param {Response} res
     */
    doListCatalog = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this.service.doListCatalog(res, id);
        } catch (error) {
            return errorResponse(res, error, 'Error on listing catalogue');
        }
    }

    /**
     * download excel and send by email
     * @param {Request} req
     * @param {Response} res
     */
    downloadPdfAndSendEmail = async (req: Request, res: Response) => {
        try {
            const body = matchedData(req);
            await this.service.downloadPdfAndSendEmail(res, body);
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error on download catalogue');
        }
    }
}