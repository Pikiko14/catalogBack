"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagesService = void 0;
const pages_models_1 = __importDefault(require("../models/pages.models"));
const api_responser_1 = require("../utils/api.responser");
const catalogues_service_1 = require("./catalogues.service");
const pdf2pic_1 = require("pdf2pic");
const utils_1 = require("../utils/utils");
class PagesService {
    constructor() {
        this.model = pages_models_1.default;
        /**
         * List pages from catalogues
         * @param {*} res
         * @param {string} catalogueId
         */
        this.listPages = async (res, catalogueId, page = 1, perPage = 16) => {
            try {
                // prepare pagination data
                page = page ? page : 1;
                perPage = perPage ? perPage : 5;
                const skip = (page - 1) * perPage;
                // do query in bbdd
                const pages = await this.model.find({
                    catalogue_id: catalogueId
                })
                    .skip(skip)
                    .limit(perPage);
                // Count model by user
                const totalPagesCatalog = await this.model.countDocuments({ catalogue_id: catalogueId });
                const totalPages = Math.ceil(totalPagesCatalog / perPage);
                // send response
                return (0, api_responser_1.successResponse)(res, {
                    pages,
                    totalPages
                }, 'List pages in catalog');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error listing catalog page');
            }
        };
        /**
         * Create new page in catalog
         * @param {Response} res
         * @param {PagesInterface} body
         */
        this.createPage = async (res, body, files) => {
            try {
                // count total pages on catalogue
                const countPages = await this.catalogService.countPagesOnCatalogue(body.catalogue_id);
                body.number = countPages + 1;
                // create page
                const page = await this.model.create(body); // create page on bbdd
                // proces files images
                let controll = 1;
                const path = await this.utils.getPath('images');
                for (const file of files) {
                    const data = {
                        path: `/${path}/${file.filename}`,
                        order: controll,
                        buttons: []
                    };
                    page.images.push(data);
                    // up controll order
                    controll++;
                }
                await page.save();
                // push page to correspondent catalogue
                await this.catalogService.pushPage(res, page.catalogue_id, page._id);
                // return data
                return (0, api_responser_1.successResponse)(res, page, 'Catalogue page created success');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error created catalog page');
            }
        };
        /**
         * Show page in catalog
         * @param {Response} res
         * @param {string} id
         */
        this.showPage = async (res, id) => {
            try {
                const page = await this.model.findById(id); // page data
                // return data
                return (0, api_responser_1.successResponse)(res, page, 'Catalogue page loaded success');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error loading catalog page');
            }
        };
        /**
         * Find by id
         * @param {number} id
         */
        this.findById = async (id) => {
            const page = await this.model.findById(id);
            if (page)
                return page;
            return false;
        };
        /**
        * Show page in catalog
        * @param {Response} res
        * @param {string} id
        */
        this.deletePages = async (res, id) => {
            try {
                const page = await this.model.findOneAndDelete({ _id: id }); // page data
                // return data
                return (0, api_responser_1.successResponse)(res, page, 'Catalogue page deleted success');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error deleteing page');
            }
        };
        /**
         * Import pdf
         * @param { body } body
         * @param { File } file
         */
        this.importPages = async (res, body, file) => {
            try {
                const path = await this.utils.getPath('images'); // get user path
                this.optionsPdfToImg.savePath = `${this.optionsPdfToImg.savePath}/${path}/`; // edit path to save
                this.optionsPdfToImg.saveFilename = `img_catalog_${body.catalogId}_${new Date().getTime().toString()}`;
                const convert = (0, pdf2pic_1.fromPath)(file.path, this.optionsPdfToImg); // conver images...
                const results = await convert.bulk(-1, { responseType: "image" }); // get images array
                // generamos la pagina del catalogo en base a cada imagen convertida
                if (results.length > 0) {
                    results.map(async (data, index) => {
                        const pageDate = {
                            number: (index + 1),
                            type: this.type,
                            catalogue_id: body.catalogId,
                            images: []
                        };
                        const image = {
                            path: `/${path}/${data.name}`,
                            order: index + 1,
                            buttons: []
                        };
                        pageDate.images.push(image);
                        const page = await this.model.create(pageDate);
                        await this.catalogService.pushPage(res, body.catalogId, page._id);
                    });
                }
                await this.utils.deleteItemFromStorage(`pdfs/${file.filename}`);
                this.optionsPdfToImg.savePath = `${__dirname}../../../uploads/`;
                // return data
                return (0, api_responser_1.successResponse)(res, results, 'Catalogue page imported success');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error on import catalogue pages.');
            }
        };
        /**
         * Delete pages from catalogs
         * @param {string} catalogId
         */
        this.deletePagesFromCatalog = async (catalogId) => {
            try {
                const pages = await this.model.find({ catalogue_id: catalogId });
                pages.forEach((page) => {
                    console.log(page);
                });
                // return data
                return true;
            }
            catch (error) {
                return error;
            }
        };
        /**
         * Set buttons on page
         * @param { Response } res
         * @param { any } body
         * @param { string } pageId
         */
        this.setButtonOnpage = async (res, body, pageId) => {
            try {
                const page = await this.model.findOneAndUpdate({
                    _id: pageId
                }, {
                    images: body,
                }, {
                    new: true
                });
                return (0, api_responser_1.successResponse)(res, page, 'Buttons set success');
            }
            catch (error) {
                return error;
            }
        };
        this.catalogService = new catalogues_service_1.CatalogueService();
        this.optionsPdfToImg = {
            density: 100,
            savePath: `${__dirname}../../../uploads/`,
            format: 'png',
            width: 500,
            height: 720
        };
        this.utils = new utils_1.Utils();
        this.type = 'simple';
    }
}
exports.PagesService = PagesService;
