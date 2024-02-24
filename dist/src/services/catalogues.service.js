"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogueService = void 0;
const utils_1 = require("../utils/utils");
const queue_service_1 = require("./queue.service");
const users_service_1 = require("./users.service");
const profiles_service_1 = require("./profiles.service");
const catalogues_model_1 = __importDefault(require("../models/catalogues.model"));
const s3_service_1 = require("../services/aws/s3/s3.service");
const api_responser_1 = require("../utils/api.responser");
class CatalogueService extends queue_service_1.QueueService {
    constructor() {
        super();
        this.model = catalogues_model_1.default;
        /**
         * List catalogues by user
         * @param {*} res
         * @param {string} userId
         * @param {number} page
         * @param {number} perPage
         * @param {string} search
         */
        this.listCatalogues = async (res, userId, page, perPage, search) => {
            try {
                // init pagination data
                page = page || 1;
                perPage = perPage || 12;
                const skip = (page - 1) * perPage;
                // Iniciar consulta
                let query = { user_id: userId };
                if (search) {
                    const searchRegex = new RegExp(search, 'i');
                    query = {
                        user_id: userId,
                        $or: [
                            { name: searchRegex },
                        ],
                    };
                }
                // do query
                const catalogues = await this.model.find(query).skip(skip).limit(perPage);
                // Count model by user
                const totalCatalogs = await this.model.countDocuments().merge(query);
                const totalPages = Math.ceil(totalCatalogs / perPage);
                // return data 
                return (0, api_responser_1.successResponse)(res, { catalogues, totalPages, totalCatalogs }, "List catalogues."); // return data
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error listing catalogues.');
            }
        };
        /**
         * Create news catalogues
         * @param { * } res
         * @param { Catalogue } body
         * @param { any } file
         */
        this.createCatalogue = async (res, body, file) => {
            try {
                // set dates
                const fileS3 = await this.s3Service.uploadSingleObject(file); // upload file to aws s3
                body.cover = `${fileS3}`;
                body.start_date = new Date(body.start_date);
                body.end_date = new Date(body.end_date);
                // create catalogue in bbdd
                const catalogue = await this.model.create(body);
                // set catalogue in user
                await this.userService.pushCatalogue(catalogue.user_id, catalogue._id);
                // reutrn response
                return (0, api_responser_1.createdResponse)(res, catalogue, "Catalogue registered correctly");
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error creating catalogues');
            }
        };
        /**
         * Create news catalogues
         * @param {*} res
         * @param {ObjectId | string} catalogueId
         */
        this.showCatalogue = async (res, catalogueId) => {
            try {
                // filter catalogue
                const catalogue = await this.model.findOne({ _id: catalogueId });
                // reutrn response
                return (0, api_responser_1.createdResponse)(res, catalogue, "Catalogue information");
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error show catalogues');
            }
        };
        /**
         * get catalogue by id
         * @param {*} catalogueId
         */
        this.findById = async (catalogueId) => {
            // find catalogue
            const catalogue = await this.model.findOne({ _id: catalogueId });
            if (catalogue)
                return catalogue;
            // main return
            return false;
        };
        /**
         * Create news catalogues
         * @param {*} res
         * @param {ObjectId | string} catalogueId
         */
        this.deleteCatalogue = async (res, catalogueId) => {
            try {
                // set catalogue in user
                const catalogue = await this.model.findOneAndDelete({ _id: catalogueId });
                // reutrn response
                return (0, api_responser_1.successResponse)(res, catalogue, "Catalogue deleted success");
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error show catalogues');
            }
        };
        /**
         * Create news catalogues
         * @param {*} res
         * @param {Catalogue} body
         * @param { any } file
         */
        this.updateCatalogue = async (res, body, file) => {
            try {
                // set dates
                body.start_date = new Date(body.start_date);
                body.end_date = new Date(body.end_date);
                // validate cover and delete old
                const catalog = await this.model.findOne({ _id: body.id });
                if (catalog.cover && file) {
                    if (catalog.cover && catalog.cover.includes('.s3.us-east-2')) {
                        const key = catalog.cover.split('/').pop();
                        await this.s3Service.deleteSingleObject(key);
                        // delete from local storage
                    }
                    else {
                        await this.utils.deleteItemFromStorage(catalog.cover); // delete cover from catalog
                    }
                    const fileS3 = await this.s3Service.uploadSingleObject(file); // upload file to aws s3
                    body.cover = `${fileS3}`;
                }
                // create catalogue in bbdd
                const catalogue = await this.model.findOneAndUpdate({
                    _id: body.id
                }, body, {
                    new: true
                });
                // reutrn response
                return (0, api_responser_1.createdResponse)(res, catalogue, "Catalogue update correctly");
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error updating catalogues');
            }
        };
        /**
         * Push page to catalogue
         * @param {res} res
         * @param {mongoose.Schema.Types.ObjectId} catalogueId
         * @param {string | mongoose.Schema.Types.ObjectId} pageId
         */
        this.pushPage = async (res, catalogueId, pageId) => {
            try {
                await this.model.findOneAndUpdate({ _id: catalogueId }, { $push: { pages: pageId } });
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error updating catalogues');
            }
        };
        /**
         * Count page on cataloguwe
         * @param {mongoose.Schema.Types.ObjectId} catalogueId
         */
        this.countPagesOnCatalogue = async (catalogueId) => {
            const catalogue = await this.model.findById(catalogueId);
            return catalogue ? catalogue.pages.length : 0;
        };
        /**
         * Delete page from catalogue pages array
         * @param {mongoose.Schema.Types.ObjectId} catalogueId
         * @param {mongoose.Schema.Types.ObjectId} page
         */
        this.deleteCatalog = async (catalogueId, page) => {
            await this.model.findOneAndUpdate(catalogueId, {
                $pull: { pages: page }
            });
        };
        /**
         * do activation on catalog
         * @param {Response} res
         * @param {string} catalogId
         */
        this.doActivateCatalog = async (res, id) => {
            try {
                const catalog = await this.model.findById(id);
                if (catalog.is_active) {
                    catalog.is_active = false;
                }
                else {
                    catalog.is_active = true;
                }
                await catalog.save();
                return (0, api_responser_1.successResponse)(res, catalog, "Catalogo state change success");
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error activating catalogues');
            }
        };
        /**
         * Create news catalogues
         * @param {*} res
         * @param {ObjectId | string} catalogueId
         */
        this.doListCatalog = async (res, catalogueId) => {
            try {
                // filter catalogue
                const catalogue = await this.model.findOne({ _id: catalogueId })
                    .populate({
                    path: 'pages',
                    populate: {
                        path: 'images.buttons.product',
                        model: 'products',
                    },
                });
                const profile = await this.profileService.getProfileByUserId(catalogue.user_id);
                // reutrn response
                return (0, api_responser_1.createdResponse)(res, { catalogue, profile }, "Catalogue information");
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error show catalogues');
            }
        };
        /**
         * Create news catalogues
         * @param { * } res
         * @param { ObjectId | string } catalogueId
         * @param { any } body
         */
        this.downloadPdfAndSendEmail = async (res, body) => {
            try {
                // filter catalogue
                const catalogue = await this.model.findOne({ _id: body.id })
                    .populate('pages');
                await this.myFirstQueue.add({
                    type: 'pdf',
                    email: body.email,
                    catalogue_id: body.id,
                    pages: catalogue.pages,
                    typeEmail: 'catalogue-download',
                });
                // reutrn response
                return (0, api_responser_1.createdResponse)(res, { catalogue }, "Download proccess catalogue started.");
            }
            catch (error) {
                throw error;
            }
        };
        this.utils = new utils_1.Utils();
        this.s3Service = new s3_service_1.S3Service();
        this.userService = new users_service_1.UserService();
        this.profileService = new profiles_service_1.ProfileService();
    }
}
exports.CatalogueService = CatalogueService;
