"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const express_validator_1 = require("express-validator");
const api_responser_1 = require("../utils/api.responser");
const products_service_1 = require("../services/products.service");
class ProductsController {
    constructor() {
        /**
         * Create products
         * @param req
         * @param res
         * @returns
         */
        this.createProducts = async (req, res) => {
            try {
                const files = req.files;
                const body = (0, express_validator_1.matchedData)(req);
                const userId = req.user.parent || req.user._id;
                await this.service.createProduct(res, body, userId, files);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error.message, 'Error create products');
            }
        };
        /**
         * List products
         * @param req
         * @param res
         * @returns
         */
        this.listProducts = async (req, res) => {
            try {
                const { page, perPage, search } = req.query;
                const userId = req.user.parent || req.user._id;
                await this.service.listProducts(res, userId, { page, perPage, search });
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error.message, 'Error listing products');
            }
        };
        /**
        * Update products
        * @param req
        * @param res
        * @returns
        */
        this.updateProducts = async (req, res) => {
            try {
                // get body data and clean data
                const files = req.files;
                const body = (0, express_validator_1.matchedData)(req);
                const userId = req.user.parent || req.user._id;
                const { productId } = req.params;
                // update product
                await this.service.updateProducts(res, body, userId, files, productId);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error.message, 'Error updating products');
            }
        };
        /**
         * Delete products
         * @param req
         * @param res
         * @returns
         */
        this.deleteProducts = async (req, res) => {
            try {
                const { productId } = req.params;
                const userId = req.user.parent || req.user._id;
                await this.service.deleteProduct(res, userId, productId);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error.message, 'Error deleting products');
            }
        };
        /**
        * show products
        * @param req
        * @param res
        * @returns
        */
        this.showProduct = async (req, res) => {
            try {
                const { productId } = req.params;
                const userId = req.user.parent || req.user._id;
                await this.service.showProduct(res, userId, productId);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error.message, 'Error show products');
            }
        };
        /**
         * set default image product
         * @param req
         * @param res
         * @returns
         */
        this.setDefaultImg = async (req, res) => {
            try {
                const { productId } = req.params;
                const body = (0, express_validator_1.matchedData)(req);
                await this.service.setDefaultImg(res, productId, body);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error.message, 'Error set default image on product.');
            }
        };
        this.service = new products_service_1.ProductsService();
    }
}
exports.ProductsController = ProductsController;
