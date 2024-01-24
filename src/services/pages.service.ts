import { Response } from "express";
import PagesModel from "../models/pages.models";
import { Images, PagesInterface } from "../interfaces/pages.interface";
import { errorResponse, successResponse } from "../utils/api.responser";
import { ResponseInterface } from "../interfaces/response.interface";
import { CatalogueService } from './catalogues.service';
import { fromPath } from "pdf2pic";
import { Utils } from "../utils/utils";
import { WriteImageResponse } from "pdf2pic/dist/types/convertResponse";

export class PagesService {
    model: any = PagesModel;
    catalogService: CatalogueService;
    optionsPdfToImg: any;
    utils: Utils;
    type: string;

    constructor() {
        this.catalogService = new CatalogueService();
        this.optionsPdfToImg = {
            density: 100,
            savePath: `${__dirname}../../../uploads/`,
            format: 'png',
            width: 500,
            height: 720
        };
        this.utils = new Utils();
        this.type = 'simple';
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
            const path = await this.utils.getPath('images');
            for (const file of files) {
                const data: Images = {
                    path: `/${path}/${file.filename}`,
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
            const path = await this.utils.getPath('images'); // get user path
            this.optionsPdfToImg.savePath = `${this.optionsPdfToImg.savePath}/${path}/`; // edit path to save
            this.optionsPdfToImg.saveFilename = `img_catalog_${body.catalogId}_${new Date().getTime().toString()}`;
            const convert = fromPath(file.path, this.optionsPdfToImg); // conver images...
            const results = await convert.bulk(-1, { responseType: "image" }); // get images array
            // generamos la pagina del catalogo en base a cada imagen convertida
            if (results.length > 0) {
                results.map(async (data: WriteImageResponse, index: number) => {
                    const pageDate: PagesInterface = {
                        number: (index + 1) as number,
                        type: this.type,
                        catalogue_id: body.catalogId,
                        images: []
                    } 
                    const image = {
                        path: `/${path}/${data.name}`,
                        order: index + 1,
                        buttons: []
                    }
                    pageDate.images.push(image);
                    const page = await this.model.create(pageDate);
                    await this.catalogService.pushPage(res,  body.catalogId, page._id);
                })
            }
            await this.utils.deleteItemFromStorage(`pdfs/${file.filename}`);
            this.optionsPdfToImg.savePath = `${__dirname}../../../uploads/`;
            // return data
            return successResponse(res, results, 'Catalogue page imported success');
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
            return successResponse(res, page, 'Buttons set success');
        } catch (error) {
            return error;
        }
    }
}