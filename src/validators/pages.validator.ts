import { check } from 'express-validator';
import { PagesService } from '../services/pages.service';
import { Request, Response, NextFunction } from 'express';
import { handlerValidator } from '../utils/handler.validator';
import { CatalogueService } from '../services/catalogues.service';

// instances
const catalogueService = new CatalogueService();
const pagesService = new PagesService();

// handlers validations
const PagesCreationValidator = [
    check('type')
        .isString()
        .withMessage('Pages type must be string')
        .notEmpty()
        .withMessage('Pages type is empty')
        .custom(async (type: string) => {
            const availableTypes: string[] = [
                'simple',
                'double',
                'triple'
            ];
            if (!availableTypes.includes(type)) {
                throw new Error('Type must be in (simple, double, triple)');
            }
        }),
    check('catalogue_id')
        .isString()
        .withMessage('Catalogue id must be string')
        .notEmpty()
        .withMessage('Catalogue id is empty')
        .isMongoId()
        .withMessage('Catalogue id must be a mongo id.')
        .custom(async (catalogueId: string) => {
            const existCatalogue = await catalogueService.findById(catalogueId);
            if (!existCatalogue) {
                throw new Error('Catalogue id dont´t exist in our records');
            }
        }),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
]; // pages creation validation

const IdPageValidator = [
    check('id')
        .isString()
        .withMessage('Page id must be string')
        .notEmpty()
        .withMessage('Page id is empty')
        .isMongoId()
        .withMessage('Page id must be a mongo id.')
        .custom(async (id: string) => {
            const existCatalogue = await pagesService.findById(id);
            if (!existCatalogue) {
                throw new Error('Page id dont´t exist in our records');
            }
        }),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
]; // id page validator

const pagesImportValdiator = [
    check('catalogId')
        .isString()
        .withMessage('Catalogue id must be string')
        .notEmpty()
        .withMessage('Catalogue id is empty')
        .isMongoId()
        .withMessage('Catalogue id must be a mongo id.')
        .custom(async (catalogueId: string) => {
            const existCatalogue = await catalogueService.findById(catalogueId);
            if (!existCatalogue) {
                throw new Error('Catalogue id dont´t exist in our records');
            }
        }),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
]; // pages import

export {
    PagesCreationValidator,
    IdPageValidator,
    pagesImportValdiator
}