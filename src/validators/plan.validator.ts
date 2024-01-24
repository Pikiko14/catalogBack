import { check, ValidationChain } from "express-validator";
import { Request, Response, NextFunction } from 'express';
import { handlerValidator } from '../utils/handler.validator';
import { PlanService } from "../services/plans.service";
import { TypeCharacteristics } from "../models/plan.model";

const planService: PlanService = new PlanService();

enum Methods {
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    UPDATE = 'UPDATE'
}

const PlanCreationValidator = [
    check('name')
        .isString()
        .withMessage('Plan name must be string')
        .notEmpty()
        .withMessage('Plan name is required')
        .isLength({ min: 5, max: 60 })
        .withMessage('The plan name must have a minimum of 5 characters and a maximum of 60.'),
    check('description')
        .isString()
        .withMessage('Description name must be string')
        .notEmpty()
        .withMessage('Plan Description is required')
        .isLength({ min: 5, max: 90 })
        .withMessage('The plan Description must have a minimum of 5 characters and a maximum of 90.'),
    check('price_month')
        .notEmpty()
        .withMessage('Month price is required')
        .isNumeric()
        .withMessage('Month price must be numeric'),
    check('price_year')
        .notEmpty()
        .withMessage('Year price is required')
        .isNumeric()
        .withMessage('Year price must be numeric'),
    check('characteristics')
        .notEmpty()
        .withMessage('Characteristics cannot be empty.')
        .isArray()
        .withMessage('Characteristics mus be array.'),
    check('characteristics.*.quantity')
        .isInt({ min: 0 })
        .withMessage('Quantity must be a non-negative integer.'),
    check('characteristics.*.description')
        .isString()
        .notEmpty()
        .withMessage('Description cannot be empty.'),
    check('characteristics.*.path')
        .isString()
        .notEmpty()
        .withMessage('Path cannot be empty.'),
    check('characteristics.*.methods')
        .isString()
        .notEmpty()
        .withMessage('Methods cannot be empty.')
        .custom(isEnumMethods)
        .withMessage(`Invalid enum value in characteristics methods field, available ${Object.values(Methods)}.`),
    check('characteristics.*.type_characteristics')
        .isString()
        .notEmpty()
        .withMessage('Type characteristic cannot be empty.')
        .custom(isEnumCharacteristic)
        .withMessage(`Invalid enum value in characteristics methods field, available ${Object.values(TypeCharacteristics)}.`),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
];

const IdPlanValidator = [
    check('id')
    .exists()
    .withMessage('Plan id does not exist')
    .notEmpty()
    .withMessage('Plan id is empty')
    .isString()
    .withMessage('Plan id must be a string')
    .isMongoId()
    .withMessage('Plan id must be a mongo id')
    .custom(async (id: string) => {
        const existCatalogue = await planService.findById(id);
        if (!existCatalogue) {
            throw new Error('Plan id dont´t exist in our records');
        }
    }),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
]; // id catalogue validator

const PlanIdValidator = [
    check('plan_id')
    .exists()
    .withMessage('Plan id does not exist')
    .notEmpty()
    .withMessage('Plan id is empty')
    .isString()
    .withMessage('Plan id must be a string')
    .isMongoId()
    .withMessage('Plan id must be a mongo id')
    .custom(async (id: string) => {
        const existCatalogue = await planService.findById(id);
        if (!existCatalogue) {
            throw new Error('Plan id dont´t exist in our records');
        }
    }),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
]; // id catalogue validator

function isEnumMethods(value: any): boolean {
    return Object.values(Methods).includes(value);
}

function isEnumCharacteristic(value: any): boolean {
    return Object.values(TypeCharacteristics).includes(value);
}

export {
    PlanCreationValidator,
    IdPlanValidator,
    PlanIdValidator
}