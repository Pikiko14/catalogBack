"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdCatalogueValidator = exports.CreateCatalogueValidator = void 0;
const express_validator_1 = require("express-validator");
const handler_validator_1 = require("../utils/handler.validator");
const catalogues_service_1 = require("../services/catalogues.service");
// instances
const catalogueService = new catalogues_service_1.CatalogueService();
// main funcstion
const isDateValid = (value) => {
    const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (!datePattern.test(value)) {
        throw new Error('The date must be in the format YYYY-mm-dd');
    }
    return true;
};
// handler validator
const CreateCatalogueValidator = [
    (0, express_validator_1.check)('name')
        .exists()
        .withMessage('The catalogue name don´t exist')
        .notEmpty()
        .withMessage('the Catalogue name is empty')
        .isLength({ min: 5, max: 60 })
        .withMessage('The catalog name must have a minimum of 5 characters and a maximum of 60.'),
    (0, express_validator_1.check)('start_date')
        .exists()
        .withMessage('The start date don´t exist')
        .notEmpty()
        .withMessage('the start date is empty')
        .custom(isDateValid),
    (0, express_validator_1.check)('end_date')
        .exists()
        .withMessage('The end date don´t exist')
        .notEmpty()
        .withMessage('the end date is empty')
        .custom(isDateValid),
    (0, express_validator_1.check)('is_active')
        .exists()
        .withMessage('The active status don´t exist')
        .notEmpty()
        .withMessage('the active status is empty')
        .isBoolean()
        .withMessage('The active status must be a boolean value'),
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
]; // create catalogue validator
exports.CreateCatalogueValidator = CreateCatalogueValidator;
const IdCatalogueValidator = [
    (0, express_validator_1.check)('id')
        .exists()
        .withMessage('Catalogue id does not exist')
        .notEmpty()
        .withMessage('Catalogue id is empty')
        .isString()
        .withMessage('Catalogue id must be a string')
        .isMongoId()
        .withMessage('Catalogue id must be a mongo id')
        .custom(async (id) => {
        const existCatalogue = await catalogueService.findById(id);
        if (!existCatalogue) {
            throw new Error('Catalogue id dont´t exist in our records');
        }
    }),
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
]; // id catalogue validator
exports.IdCatalogueValidator = IdCatalogueValidator;
