import { Response } from "express";
import { Utils } from "../utils/utils";
import PagesModel from "../models/pages.models";
import { CatalogueService } from './catalogues.service';
import { S3Service } from "../services/aws/s3/s3.service";
import { Images, PagesInterface } from "../interfaces/pages.interface";
import { errorResponse, successResponse } from "../utils/api.responser";
import { ResponseInterface } from "../interfaces/response.interface";
import { QueueService } from "./queue.service";

export class PagesService {
    utils: Utils;
    type: string;
    s3Service: S3Service;
    model: any = PagesModel;
    catalogService: CatalogueService;

    constructor() {
        this.type = 'simple';
        this.utils = new Utils();
        this.s3Service = new S3Service();
        this.catalogService = new CatalogueService();
    }

    /**
     * List pages from catalogues
     * @param {*} res
     * @param {string} catalogueId
     */
    listPages = async (
        res: Response,
        catalogueId: string,
        page: number = 1,
        perPage: number = 16
    ): Promise<ResponseInterface | PagesInterface | void> => {
        try {
            // prepare pagination data
            page = page ? page : 1;
            perPage = perPage ? perPage : 5;
            const skip = (page - 1) * perPage;
            // do query in bbdd
            const pages: PagesInterface[] = await this.model.find({
                catalogue_id: catalogueId
            })
            .skip(skip)
            .limit(perPage);
            // Count model by user
            const totalPagesCatalog = await this.model.countDocuments({ catalogue_id: catalogueId });
            const totalPages = Math.ceil(totalPagesCatalog / perPage);
            // send response
            return successResponse(
                res,
                {
                    pages,
                    totalPages
                },
                'List pages in catalog'
            );
        } catch (error) {
            return errorResponse(res, error, 'Error listing catalog page');
        }
    }

    /**
     * Create new page in catalog
     * @param {Response} res
     * @param {PagesInterface} body
     */
    createPage = async (res: Response, body: PagesInterface, files: any[]) => {
        try {
            // count total pages on catalogue
            const countPages = await this.catalogService.countPagesOnCatalogue(body.catalogue_id);
            body.number = countPages + 1;
            // create page
            const page: PagesInterface | any = await this.model.create(body); // create page on bbdd
            // proces files images
            let controll = 1;
            const filesArray = await this.s3Service.uploadMultipleFiles(files);
            for (const file of filesArray) {
                const data: Images = {
                    path: file,
                    order: controll,
                    buttons: []
                }
                page.images.push(data);
                // up controll order
                controll++;
            }
            await page.save();
            // push page to correspondent catalogue
            await this.catalogService.pushPage(res, page.catalogue_id, page._id);
            // return data
            return successResponse(res, page, 'Catalogue page created success');
        } catch (error) {
            return errorResponse(res, error, 'Error created catalog page');
        }
    }

    /**
     * Show page in catalog
     * @param {Response} res
     * @param {string} id
     */
    showPage = async (res: Response, id: string) => {
        try {
            const page: PagesInterface = await this.model.findById(id); // page data
            // return data
            return successResponse(res, page, 'Catalogue page loaded success');
        } catch (error) {
            return errorResponse(res, error, 'Error loading catalog page');
        }
    }

    /**
     * Find by id
     * @param {number} id
     */
    findById = async (id: string) => {
        const page = await this.model.findById(id);
        if (page)
            return page
        return false
    }

     /**
     * Show page in catalog
     * @param {Response} res
     * @param {string} id
     */
     deletePages = async (res: Response, id: string) => {
        try {
            const page: PagesInterface = await this.model.findOneAndDelete({ _id: id }); // page data
            // return data
            return successResponse(res, page, 'Catalogue page deleted success');
        } catch (error) {
            return errorResponse(res, error, 'Error deleteing page');
        }
    }

    /**
     * Import pdf
     * @param { body } body
     * @param { File } file
     */
    importPages = async (res: Response, body: any, file: any) => {
        try {
            // do queue job for process pdf
            const queueService = new QueueService();
            queueService.myFirstQueue.add({
                type: 'page',
                file,
                action: 'process-pdf-to-image',
                catalogue_id: body.catalogId
            });
            // return data
            return successResponse(res, { file }, 'Catalogue page imported success');
        } catch (error) {
            return errorResponse(res, error, 'Error on import catalogue pages.');
        }
    }

    /**
     * Delete pages from catalogs
     * @param {string} catalogId
     */
    deletePagesFromCatalog = async (catalogId: string) => {
        try {
            const pages = await this.model.find({ catalogue_id: catalogId });
            pages.forEach((page: PagesInterface) => {
                console.log(page);
            });
            // return data
            return true;
        } catch (error) {
            return error;
        }
    }

    /**
     * Set buttons on page
     * @param { Response } res 
     * @param { any } body 
     * @param { string } pageId
     */
    setButtonOnpage = async (res: Response, body: any, pageId: string) => {
        try {
            // save page
            const page = await this.model.findOneAndUpdate(
                {
                    _id: pageId
                },
                {
                    images: body,
                },
                {
                    new: true
                }
            );
            return successResponse(res, page, 'buttons configured correctly');
        } catch (error) {
            return error;
        }
    }

    /**
     * save page from pdf
     * @param { * } page
     */
    savePageFromPdfToImg = async (page: PagesInterface) => {
        try {
            await this.model.create(page);
        } catch (error: any) {
            throw error.message;
        }
    }
}