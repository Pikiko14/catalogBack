import { check, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { handlerValidator } from '../utils/handler.validator';
import { CategoriesService } from '../services/categories.service';
import { Utils } from '../utils/utils';

// instances
const utils = new Utils();

// do validator
const categoriesService = new CategoriesService();

// categories cration valdiator
const CategoriesCreationValidator = [
    check('name')
        .isString()
        .withMessage('Category name must be string')
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ min: 3, max: 90 })
        .withMessage('Category name must have a minimum of 5 characters and a maximum of 60.'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty() && req.file) {
            console.log(req.file);
            utils.deleteItemFromStorage(`categories/${req.file.filename}`);
        }
        handlerValidator(req, res, next);
    },
];

// id categories validator
const CategoryIdValidator = [
    check('id')
    .exists()
    .withMessage('Category id does not exist')
    .notEmpty()
    .withMessage('Category id is empty')
    .isString()
    .withMessage('Category id must be a string')
    .isMongoId()
    .withMessage('Category id must be a mongo id')
    .custom(async (id: string) => {
        const existCategory = await categoriesService.findById(id);
        if (!existCategory) {
            throw new Error('Category id dont´t exist in our records');
        }
        return true;
    }),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty() && req.file) {
            console.log(req.file);
            utils.deleteItemFromStorage(`categories/${req.file.filename}`);
        }
        handlerValidator(req, res, next);
    },
];

export {
    CategoryIdValidator,
    CategoriesCreationValidator,
}
