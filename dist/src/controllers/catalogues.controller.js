"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogueController = void 0;
const express_validator_1 = require("express-validator");
const api_responser_1 = require("../utils/api.responser");
const catalogues_service_1 = require("../services/catalogues.service");
class CatalogueController {
    constructor() {
        /**
         * List catalogue by user
         * @param {Request} req
         * @param {Response} res
         */
        this.listCatalogues = async (req, res) => {
            try {
                const { _id, parent } = req.user; // get user login id.
                const { page, perPage, search } = req.query; // get pagination data
                await this.service.listCatalogues(res, parent ? parent : _id, page, perPage, search); // list catalogues.
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error listing catalogues.');
            }
        };
        /**
         * Create catalogue
         * @param {Request} req
         * @param {Response} res
         */
        this.createCatalogue = async (req, res) => {
            try {
                const body = (0, express_validator_1.matchedData)(req); // get body clean
                body.cover = `/${this.publicPath}/${req.file.filename}`;
                const { _id, parent } = req.user; // get user loged id
                body.user_id = parent ? parent : _id; // set  main user id
                await this.service.createCatalogue(res, body);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error creating catalogues.');
            }
        };
        /**
         * Show catalogue
         * @param {Request} req
         * @param {Response} res
         */
        this.showCatalogue = async (req, res) => {
            try {
                const { id } = req.params; // get id param in request
                await this.service.showCatalogue(res, id);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error show catalogue');
            }
        };
        /**
         * Show catalogue
         * @param {Request} req
         * @param {Response} res
         */
        this.updateCatalogue = async (req, res) => {
            try {
                const body = (0, express_validator_1.matchedData)(req); // get body clean
                if (req.file) {
                    body.cover = `/${this.publicPath}/${req.file.filename}`;
                }
                const { id } = req.params; // get id param in request
                await this.service.updateCatalogue(res, body);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error on update catalogue');
            }
        };
        /**
         * Show catalogue
         * @param {Request} req
         * @param {Response} res
         */
        this.deleteCatalogue = async (req, res) => {
            try {
                const { id } = req.params;
                await this.service.deleteCatalogue(res, id);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error on delete catalogue');
            }
        };
        /**
         * do activation catalogs
         * @param {Request} req
         * @param {Response} res
         */
        this.doActivateCatalog = async (req, res) => {
            try {
                const { id } = req.params;
                await this.service.doActivateCatalog(res, id);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error on activation of catalogue');
            }
        };
        this.service = new catalogues_service_1.CatalogueService();
        this.publicPath = 'catalogues';
    }
}
exports.CatalogueController = CatalogueController;
