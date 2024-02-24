import { check } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { handlerValidator } from '../utils/handler.validator';
import { CatalogueService } from '../services/catalogues.service';

// instances
const catalogueService = new CatalogueService();

// main funcstion
const isDateValid = (value: string) => {
    const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (!datePattern.test(value)) {
      throw new Error('The date must be in the format YYYY-mm-dd');
    }
    return true;
};

// handler validator
const CreateCatalogueValidator = [
    check('name')
        .exists()
        .withMessage('The catalogue name don´t exist')
        .notEmpty()
        .withMessage('the Catalogue name is empty')
        .isLength({ min: 5, max: 60 })
        .withMessage('The catalog name must have a minimum of 5 characters and a maximum of 60.'),
    check('start_date')
        .exists()
        .withMessage('The start date don´t exist')
        .notEmpty()
        .withMessage('the start date is empty')
        .custom(isDateValid),
    check('end_date')
        .exists()
        .withMessage('The end date don´t exist')
        .notEmpty()
        .withMessage('the end date is empty')
        .custom(isDateValid),
    check('is_active')
        .exists()
        .withMessage('The active status don´t exist')
        .notEmpty()
        .withMessage('the active status is empty')
        .isBoolean()
        .withMessage('The active status must be a boolean value'),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
]; // create catalogue validator

const IdCatalogueValidator = [
    check('id')
    .exists()
    .withMessage('Catalogue id does not exist')
    .notEmpty()
    .withMessage('Catalogue id is empty')
    .isString()
    .withMessage('Catalogue id must be a string')
    .isMongoId()
    .withMessage('Catalogue id must be a mongo id')
    .custom(async (id: string) => {
        const existCatalogue = await catalogueService.findById(id);
        if (!existCatalogue) {
            throw new Error('Catalogue id dont´t exist in our records');
        }
        return true;
    }),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
]; // id catalogue validator

const EmailValidator = [
    check('email')
    .exists()
    .withMessage('Email does not exist')
    .notEmpty()
    .withMessage('Email is empty')
    .isString()
    .withMessage('Email must be a string')
    .isEmail()
    .withMessage('Invalid email format')
    .isLength({ min: 5, max: 90 })
    .withMessage('Email must have a minimum of 5 characters'),
(req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
];

export {
    CreateCatalogueValidator,
    IdCatalogueValidator,
    EmailValidator,
}