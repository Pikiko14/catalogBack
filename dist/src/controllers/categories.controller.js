"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesController = void 0;
const express_validator_1 = require("express-validator");
const api_responser_1 = require("../utils/api.responser");
const categories_service_1 = require("../services/categories.service");
class CategoriesController {
    constructor() {
        /**
         * Create categories
         * @param req
         * @param res
         * @returns
         */
        this.createCategories = async (req, res) => {
            try {
                const { user } = req;
                const file = req.file;
                const body = (0, express_validator_1.matchedData)(req);
                await this.service.createCategories(res, { user, body, file });
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error.message, 'Error create categories');
            }
        };
        /**
         * List categories
         * @param req
         * @param res
         * @returns
         */
        this.listCategories = async (req, res) => {
            try {
                const { page, perPage, search } = req.query;
                const userId = req.user.parent || req.user._id;
                await this.service.listCategories(res, userId, { page, perPage, search });
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error.message, 'Error create categories');
            }
        };
        /**
        * Update categories
        * @param req
        * @param res
        * @returns
        */
        this.updateCategories = async (req, res) => {
            try {
                const { id } = req.params;
                const file = req.file;
                const body = (0, express_validator_1.matchedData)(req);
                await this.service.updateCategories(res, id, body, file);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error.message, 'Error create categories');
            }
        };
        /**
         * Delete categories
         * @param req
         * @param res
         * @returns
         */
        this.deleteCategories = async (req, res) => {
            try {
                const { id } = req.params;
                await this.service.deleteCategories(res, id);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error.message, 'Error create categories');
            }
        };
        /**
         * List categories by catalogue
         * @param req
         * @param res
         * @returns
         */
        this.listCategoriesByCatalog = async (req, res) => {
            try {
                const { catalogue } = req.params;
                await this.service.listCategoriesByCatalog(res, catalogue);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, error.message);
            }
        };
        this.service = new categories_service_1.CategoriesService();
    }
}
exports.CategoriesController = CategoriesController;
