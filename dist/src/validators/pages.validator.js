"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagesImportValdiator = exports.IdPageValidator = exports.PagesCreationValidator = void 0;
const express_validator_1 = require("express-validator");
const pages_service_1 = require("../services/pages.service");
const handler_validator_1 = require("../utils/handler.validator");
const catalogues_service_1 = require("../services/catalogues.service");
// instances
const catalogueService = new catalogues_service_1.CatalogueService();
const pagesService = new pages_service_1.PagesService();
// handlers validations
const PagesCreationValidator = [
    (0, express_validator_1.check)('type')
        .isString()
        .withMessage('Pages type must be string')
        .notEmpty()
        .withMessage('Pages type is empty')
        .custom(async (type) => {
        const availableTypes = [
            'simple',
            'double',
            'triple'
        ];
        if (!availableTypes.includes(type)) {
            throw new Error('Type must be in (simple, double, triple)');
        }
    }),
    (0, express_validator_1.check)('catalogue_id')
        .isString()
        .withMessage('Catalogue id must be string')
        .notEmpty()
        .withMessage('Catalogue id is empty')
        .isMongoId()
        .withMessage('Catalogue id must be a mongo id.')
        .custom(async (catalogueId) => {
        const existCatalogue = await catalogueService.findById(catalogueId);
        if (!existCatalogue) {
            throw new Error('Catalogue id dont´t exist in our records');
        }
    }),
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
]; // pages creation validation
exports.PagesCreationValidator = PagesCreationValidator;
const IdPageValidator = [
    (0, express_validator_1.check)('id')
        .isString()
        .withMessage('Page id must be string')
        .notEmpty()
        .withMessage('Page id is empty')
        .isMongoId()
        .withMessage('Page id must be a mongo id.')
        .custom(async (id) => {
        const existCatalogue = await pagesService.findById(id);
        if (!existCatalogue) {
            throw new Error('Page id dont´t exist in our records');
        }
    }),
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
]; // id page validator
exports.IdPageValidator = IdPageValidator;
const pagesImportValdiator = [
    (0, express_validator_1.check)('catalogId')
        .isString()
        .withMessage('Catalogue id must be string')
        .notEmpty()
        .withMessage('Catalogue id is empty')
        .isMongoId()
        .withMessage('Catalogue id must be a mongo id.')
        .custom(async (catalogueId) => {
        const existCatalogue = await catalogueService.findById(catalogueId);
        if (!existCatalogue) {
            throw new Error('Catalogue id dont´t exist in our records');
        }
    }),
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
]; // pages import
exports.pagesImportValdiator = pagesImportValdiator;
