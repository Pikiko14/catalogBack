"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesCreationValidator = exports.CategoryIdValidator = void 0;
const express_validator_1 = require("express-validator");
const handler_validator_1 = require("../utils/handler.validator");
const categories_service_1 = require("../services/categories.service");
// do validator
const categoriesService = new categories_service_1.CategoriesService();
// categories cration valdiator
const CategoriesCreationValidator = [
    (0, express_validator_1.check)('name')
        .isString()
        .withMessage('Category name must be string')
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ min: 3, max: 60 })
        .withMessage('Category name must have a minimum of 5 characters and a maximum of 60.'),
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
];
exports.CategoriesCreationValidator = CategoriesCreationValidator;
// id categories validator
const CategoryIdValidator = [
    (0, express_validator_1.check)('id')
        .exists()
        .withMessage('Category id does not exist')
        .notEmpty()
        .withMessage('Category id is empty')
        .isString()
        .withMessage('Category id must be a string')
        .isMongoId()
        .withMessage('Category id must be a mongo id')
        .custom(async (id) => {
        const existCategory = await categoriesService.findById(id);
        if (!existCategory) {
            throw new Error('Category id dont´t exist in our records');
        }
    }),
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
];
exports.CategoryIdValidator = CategoryIdValidator;
