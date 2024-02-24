"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const utils_1 = require("../utils/utils");
const categories_model_1 = __importDefault(require("../models/categories.model"));
const api_responser_1 = require("../utils/api.responser");
const catalogues_service_1 = require("./catalogues.service");
const s3_service_1 = require("./aws/s3/s3.service");
class CategoriesService {
    constructor() {
        this.model = categories_model_1.default;
        /**
         * create categories
         * @param { Response } res
         * @param { any } params
         */
        this.createCategories = async (res, { body, user, file }) => {
            try {
                body.user_id = user.parent || user._id;
                const category = await this.model.create(body);
                if (file) {
                    const fileS3 = await this.s3Service.uploadSingleObject(file);
                    category.image = fileS3;
                }
                await category.save();
                return (0, api_responser_1.successResponse)(res, category, 'Category created success');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error create categories');
            }
        };
        /**
         *
         * @param { Response } res
         * @param { string } userId
         * @param page
         * @param perPage
         * @returns
         */
        this.listCategories = async (res, userId, { page, perPage, search }) => {
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
                const categories = await this.model.find(query).skip(skip).limit(perPage);
                // Count model by user
                const totalCategories = await this.model.countDocuments().merge(query);
                const totalPages = Math.ceil(totalCategories / perPage);
                // return data 
                return (0, api_responser_1.successResponse)(res, { categories, totalPages, totalCategories }, 'List Categories');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error.message, 'Error listing categories');
            }
        };
        /**
         * find category by id
         * @param { string } id
         */
        this.findById = async (id) => {
            const category = await this.model.findById(id);
            if (category) {
                return category;
            }
        };
        /**
         * update category
         * @param { Response } res
         * @param { string } id
         * @param { CategoryInterface } body
         * @returns
         */
        this.updateCategories = async (res, id, body, file) => {
            try {
                const category = await this.model.findOneAndUpdate({
                    _id: id
                }, body, {
                    new: true
                });
                if (file) {
                    if (category.image) {
                        if (category.image && category.image.includes('.s3.us-east-2')) {
                            const key = category.image.split('/').pop();
                            await this.s3Service.deleteSingleObject(key);
                        }
                        else {
                            await this.utils.deleteItemFromStorage(category.image);
                        }
                    }
                    // save new image
                    const fileS3 = await this.s3Service.uploadSingleObject(file);
                    category.image = fileS3;
                    await category.save();
                }
                return (0, api_responser_1.successResponse)(res, category, 'Category updated success');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error.message, 'Error updating categories');
            }
        };
        /**
         * delete category
         * @param { Response } res
         * @param { string } id
         */
        this.deleteCategories = async (res, id) => {
            try {
                const category = await this.model.findOneAndDelete({
                    _id: id
                });
                if (category.image) {
                    if (category.image && category.image.includes('.s3.us-east-2')) {
                        const key = category.image.split('/').pop();
                        await this.s3Service.deleteSingleObject(key);
                    }
                    else {
                        await this.utils.deleteItemFromStorage(category.image);
                    }
                }
                return (0, api_responser_1.successResponse)(res, category, "Categories deleted success");
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error.message, 'Error deleting categories');
            }
        };
        this.utils = new utils_1.Utils;
        this.s3Service = new s3_service_1.S3Service();
        this.catalogueService = new catalogues_service_1.CatalogueService();
    }
    /**
     * @param { Response } res
     * @param { string } catalogueId
     */
    async listCategoriesByCatalog(res, catalogueId) {
        try {
            let categories = [];
            const catalogue = await this.catalogueService.findById(catalogueId);
            if (catalogue) {
                categories = await this.model.find({ user_id: catalogue.user_id }, '_id name image');
            }
            return (0, api_responser_1.successResponse)(res, categories, 'Categories list');
        }
        catch (error) {
            throw error;
        }
    }
}
exports.CategoriesService = CategoriesService;
