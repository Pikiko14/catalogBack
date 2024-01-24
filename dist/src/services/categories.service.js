"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const categories_model_1 = __importDefault(require("../models/categories.model"));
const api_responser_1 = require("../utils/api.responser");
class CategoriesService {
    constructor() {
        this.model = categories_model_1.default;
        /**
         * create categories
         * @param { Response } res
         * @param { any } params
         */
        this.createCategories = async (res, { body, user }) => {
            try {
                body.user_id = user.parent || user._id;
                const category = await this.model.create(body);
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
                return (0, api_responser_1.successResponse)(res, { categories, totalPages }, 'List Categories');
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
        this.updateCategories = async (res, id, body) => {
            try {
                const category = await this.model.findOneAndUpdate({
                    _id: id
                }, body, {
                    new: true
                });
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
                return (0, api_responser_1.successResponse)(res, category, "Categories deleted success");
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error.message, 'Error deleting categories');
            }
        };
    }
}
exports.CategoriesService = CategoriesService;
