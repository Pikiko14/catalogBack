"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogueService = void 0;
const utils_1 = require("../utils/utils");
const users_service_1 = require("./users.service.");
const catalogues_model_1 = __importDefault(require("../models/catalogues.model"));
const api_responser_1 = require("../utils/api.responser");
class CatalogueService {
    constructor() {
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
                const totalUsers = await this.model.countDocuments().merge(query);
                const totalPages = Math.ceil(totalUsers / perPage);
                // return data 
                return (0, api_responser_1.successResponse)(res, { catalogues, totalPages }, "List catalogues."); // return data
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error listing catalogues.');
            }
        };
        /**
         * Create news catalogues
         * @param {*} res
         * @param {Catalogue} body
         */
        this.createCatalogue = async (res, body) => {
            try {
                // set dates
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
         */
        this.updateCatalogue = async (res, body) => {
            try {
                // set dates
                body.start_date = new Date(body.start_date);
                body.end_date = new Date(body.end_date);
                // validate cover and delete old
                if (body.cover) {
                    const catalog = await this.model.findOne({ _id: body.id });
                    await this.utils.deleteItemFromStorage(catalog.cover);
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
        this.utils = new utils_1.Utils();
        this.userService = new users_service_1.UserService();
    }
}
exports.CatalogueService = CatalogueService;
