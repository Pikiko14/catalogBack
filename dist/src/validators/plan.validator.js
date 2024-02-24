"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanIdValidator = exports.IdPlanValidator = exports.PlanCreationValidator = void 0;
const express_validator_1 = require("express-validator");
const handler_validator_1 = require("../utils/handler.validator");
const plans_service_1 = require("../services/plans.service");
const plan_model_1 = require("../models/plan.model");
const planService = new plans_service_1.PlanService();
var Methods;
(function (Methods) {
    Methods["POST"] = "POST";
    Methods["PUT"] = "PUT";
    Methods["DELETE"] = "DELETE";
    Methods["UPDATE"] = "UPDATE";
})(Methods || (Methods = {}));
const PlanCreationValidator = [
    (0, express_validator_1.check)('name')
        .isString()
        .withMessage('Plan name must be string')
        .notEmpty()
        .withMessage('Plan name is required')
        .isLength({ min: 5, max: 60 })
        .withMessage('The plan name must have a minimum of 5 characters and a maximum of 60.'),
    (0, express_validator_1.check)('description')
        .isString()
        .withMessage('Description name must be string')
        .notEmpty()
        .withMessage('Plan Description is required')
        .isLength({ min: 5, max: 90 })
        .withMessage('The plan Description must have a minimum of 5 characters and a maximum of 90.'),
    (0, express_validator_1.check)('price_month')
        .notEmpty()
        .withMessage('Month price is required')
        .isNumeric()
        .withMessage('Month price must be numeric'),
    (0, express_validator_1.check)('price_year')
        .notEmpty()
        .withMessage('Year price is required')
        .isNumeric()
        .withMessage('Year price must be numeric'),
    (0, express_validator_1.check)('characteristics')
        .notEmpty()
        .withMessage('Characteristics cannot be empty.')
        .isArray()
        .withMessage('Characteristics mus be array.'),
    (0, express_validator_1.check)('characteristics.*.quantity')
        .isInt({ min: 0 })
        .withMessage('Quantity must be a non-negative integer.'),
    (0, express_validator_1.check)('characteristics.*.description')
        .isString()
        .notEmpty()
        .withMessage('Description cannot be empty.'),
    (0, express_validator_1.check)('characteristics.*.path')
        .isString()
        .notEmpty()
        .withMessage('Path cannot be empty.'),
    (0, express_validator_1.check)('characteristics.*.methods')
        .isString()
        .notEmpty()
        .withMessage('Methods cannot be empty.')
        .custom(isEnumMethods)
        .withMessage(`Invalid enum value in characteristics methods field, available ${Object.values(Methods)}.`),
    (0, express_validator_1.check)('characteristics.*.type_characteristics')
        .isString()
        .notEmpty()
        .withMessage('Type characteristic cannot be empty.')
        .custom(isEnumCharacteristic)
        .withMessage(`Invalid enum value in characteristics methods field, available ${Object.values(plan_model_1.TypeCharacteristics)}.`),
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
];
exports.PlanCreationValidator = PlanCreationValidator;
const IdPlanValidator = [
    (0, express_validator_1.check)('id')
        .exists()
        .withMessage('Plan id does not exist')
        .notEmpty()
        .withMessage('Plan id is empty')
        .isString()
        .withMessage('Plan id must be a string')
        .isMongoId()
        .withMessage('Plan id must be a mongo id')
        .custom(async (id) => {
        const existCatalogue = await planService.findById(id);
        if (!existCatalogue) {
            throw new Error('Plan id dont´t exist in our records');
        }
        return true;
    }),
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
]; // id catalogue validator
exports.IdPlanValidator = IdPlanValidator;
const PlanIdValidator = [
    (0, express_validator_1.check)('plan_id')
        .exists()
        .withMessage('Plan id does not exist')
        .notEmpty()
        .withMessage('Plan id is empty')
        .isString()
        .withMessage('Plan id must be a string')
        .isMongoId()
        .withMessage('Plan id must be a mongo id')
        .custom(async (id) => {
        const existCatalogue = await planService.findById(id);
        if (!existCatalogue) {
            throw new Error('Plan id dont´t exist in our records');
        }
        return true;
    }),
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
]; // id catalogue validator
exports.PlanIdValidator = PlanIdValidator;
function isEnumMethods(value) {
    return Object.values(Methods).includes(value);
}
function isEnumCharacteristic(value) {
    return Object.values(plan_model_1.TypeCharacteristics).includes(value);
}
