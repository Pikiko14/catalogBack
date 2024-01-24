"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagesController = void 0;
const express_validator_1 = require("express-validator");
const api_responser_1 = require("../utils/api.responser");
const pages_service_1 = require("../services/pages.service");
const pages_quantity_decorator_1 = require("../decorators/pages-quantity.decorator");
const pages_import_decorator_1 = require("../decorators/pages-import.decorator");
class PagesController {
    constructor() {
        /**
         * List catalogue pages
         * @param {Request} req
         * @param {Response} res
         */
        this.listPages = async (req, res) => {
            try {
                const { id } = req.params; // get catalogue id
                const { page, perPage } = req.query;
                await this.service.listPages(res, id, page, perPage);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error listing catalogue pages.');
            }
        };
        /**
         * Show catalogue pages
         * @param {Request} req
         * @param {Response} res
         */
        this.showPages = async (req, res) => {
            try {
                const { id } = req.params; // get id in params
                await this.service.showPage(res, id);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error listing catalogue pages.');
            }
        };
        /**
         * Delete catalogue page
         * @param {Request} req
         * @param {Response} res
         */
        this.deletePages = async (req, res) => {
            try {
                const { id } = req.params; // get id in params
                await this.service.deletePages(res, id);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error listing catalogue pages.');
            }
        };
        this.service = new pages_service_1.PagesService();
        this.createPages = this.createPages.bind(this);
        this.importPages = this.importPages.bind(this);
        this.setButtonOnpage = this.setButtonOnpage.bind(this);
    }
    /**
     * Create catalogue pages
     * @param {Request} req
     * @param {Response} res
     */
    async createPages(req, res) {
        try {
            const files = req.files;
            const body = (0, express_validator_1.matchedData)(req); // get clean body data
            await this.service.createPage(res, body, files);
        }
        catch (error) {
            return (0, api_responser_1.errorResponse)(res, error, 'Error creating catalogue pages.');
        }
    }
    ;
    /**
     * import catalogue page
     * @param {Request} req
     * @param {Response} res
     */
    async importPages(req, res) {
        try {
            const body = (0, express_validator_1.matchedData)(req);
            await this.service.importPages(res, body, req.file);
        }
        catch (error) {
            return (0, api_responser_1.errorResponse)(res, error, 'Error on import catalogue pages.');
        }
    }
    /**
     * set buttons on page
     * @param {Request} req
     * @param {Response} res
     */
    async setButtonOnpage(req, res) {
        try {
            const { body } = req;
            const { id } = req.params;
            await this.service.setButtonOnpage(res, body, id);
        }
        catch (error) {
            return (0, api_responser_1.errorResponse)(res, error, 'Error set button on catalogue pages.');
        }
    }
}
exports.PagesController = PagesController;
__decorate([
    pages_quantity_decorator_1.PagesCountDecorator
], PagesController.prototype, "createPages", null);
__decorate([
    pages_import_decorator_1.PagesImportDecorator
], PagesController.prototype, "importPages", null);
