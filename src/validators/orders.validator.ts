import { check } from "express-validator";
import { NextFunction, Response, Request } from "express";
import { handlerValidator } from "../utils/handler.validator";
import { ProductsService } from "../services/products.service";
import { ClientInterface, ItemsInterface } from "../interfaces/orders.interface";
import { CatalogueService } from "../services/catalogues.service";

// services instances
const productService = new ProductsService();
const catalogueService = new CatalogueService();

// creation valdiator
const OrdersCreationValidator = [
    check('client')
        .notEmpty()
        .withMessage('Order client is required')
        .custom((client: ClientInterface) => {
            if (typeof client !== 'object') {
                throw new Error('Order client must be object');
            }
            return true;
        }),
    check('client.name')
        .notEmpty()
        .withMessage('Client name is required')
        .isLength({ min: 3, max: 60 })
        .withMessage('Client name must have a minimum of 3 characters and a maximum of 60.'),
    check('client.last_name')
        .notEmpty()
        .withMessage('Client last name is required')
        .isLength({ min: 3, max: 60 })
        .withMessage('Client last name must have a minimum of 3 characters and a maximum of 60.'),
    check('client.email')
        .notEmpty()
        .withMessage('Client email is required')
        .isString()
        .withMessage('Client email must be a string')
        .isEmail()
        .withMessage('Invalid client email format'),
    check('client.phone')
        .isString()
        .withMessage('Client phone must be string')
        .matches(/^\+\d{1,3}\d{1,14}$/)
        .withMessage('Client phone number must be a valid international phone number starting with +'),
    check('client.address')
        .notEmpty()
        .withMessage('Client address is required')
        .isString()
        .withMessage('Client phone must be string')
        .isLength({ min: 3, max: 90 })
        .withMessage('Client address must have a minimum of 3 characters and a maximum of 90.'),
    check('client.city')
        .notEmpty()
        .withMessage('Client city is required')
        .isString()
        .withMessage('Client phone must be string')
        .isLength({ min: 3, max: 60 })
        .withMessage('Client city must have a minimum of 3 characters and a maximum of 60.'),
    check('client.country')
        .notEmpty()
        .withMessage('Client country is required')
        .isString()
        .withMessage('Client country must be string')
        .isLength({ min: 3, max: 60 })
        .withMessage('Client city must have a minimum of 3 characters and a maximum of 60.'),
    check('client.document')
        .notEmpty()
        .withMessage('Client document is required')
        .isNumeric()
        .withMessage('Client document must be numeric value')
        .isLength({ min: 6, max: 15 })
        .withMessage('Client document must have a minimum of 6 characters and a maximum of 15.'),
    check('total')
        .optional()
        .isNumeric()
        .withMessage('Order total must be a numeric value')
        .custom((value: number) => {
            if (value < 0) {
                throw new Error('Order total must be greater than or equal to 0');
            }
            return true;
        }),
    check('tax')
        .optional()
        .isNumeric()
        .withMessage('Order tax must be a numeric value')
        .custom((value: number) => {
            if (value < 0 || value > 99) {
                throw new Error('Order tax must be greater than 0 and lower than 100');
            }
            return true;
        }),
    check('total_tax')
        .optional()
        .isNumeric()
        .withMessage('Order total tax must be a numeric value')
        .custom((value: number) => {
            if (value < 0) {
                throw new Error('Order total tax must be greater than or equal to 0');
            }
            return true;
        }),
    check('base')
        .optional()
        .isNumeric()
        .withMessage('Order base must be a numeric value')
        .custom((value: number) => {
            if (value < 0) {
                throw new Error('Order base must be greater than or equal to 0');
            }
            return true;
        }),
    check('catalogue_id')
        .notEmpty()
        .isMongoId()
        .withMessage('Order catalogue id must be a mongo id value')
        .custom(async (value: string) => {
            // validate if parent exists on our recorss
            const catalogue = await catalogueService.findById(value);
            if (!catalogue) {
                throw new Error(`Catalogue id ${value} don´t exists in our records`);
            }
            // success validation
            return true;
        }),
    check('items')
        .notEmpty()
        .withMessage('Order items is required')
        .custom((items: ItemsInterface) => {
            if (typeof items !== 'object') {
                throw new Error('Order items must be array');
            }
            return true;
        }),
    check('items.*.attribute')
        .optional()
        .isString()
        .withMessage('Item attribute must be string')
        .isLength({ min: 0, max: 60 })
        .withMessage('Item attribute must have a minimum of 0 characters and a maximum of 60.'),
    check('items.*.reference')
        .notEmpty()
        .withMessage('Item reference is required')
        .isString()
        .withMessage('Item reference must be string')
        .isLength({ min: 1, max: 60 })
        .withMessage('Item reference must have a minimum of 1 characters and a maximum of 60.'),
    check('items.*.price')
        .notEmpty()
        .withMessage('Item price is required')
        .isNumeric()
        .withMessage('Item price must be numeric value')
        .custom((value: number) => {
            if (value < 0) {
                throw new Error('Item price must be greater than or equal to 0');
            }
            return true;
        }),
    check('items.*.quantity')
        .notEmpty()
        .withMessage('Item quantity is required')
        .isNumeric()
        .withMessage('Item quantity must be numeric value')
        .custom((value: number) => {
            if (value <= 0) {
                throw new Error('Item quantity must be greater than 0');
            }
            return true;
        }),
    check('items.*.tax')
        .notEmpty()
        .withMessage('Item tax is required')
        .isNumeric()
        .withMessage('Item tax must be numeric value')
        .custom((value: number) => {
            if (value < 0) {
                throw new Error('Item tax must be greater or equal than 0');
            }
            return true;
        }),
    check('items.*.total')
        .notEmpty()
        .withMessage('Item total is required')
        .isNumeric()
        .withMessage('Item total must be numeric value')
        .custom((value: number) => {
            if (value < 1) {
                throw new Error('Item total must be greater than 0');
            }
            return true;
        }),
    check('items.*.total_tax')
        .notEmpty()
        .isNumeric()
        .withMessage('Item total tax must be a numeric value')
        .custom((value: number) => {
            if (value < 0) {
                throw new Error('item total tax must be greater than or equal to 0');
            }
            return true;
        }),
    check('items.*.base')
        .optional()
        .isNumeric()
        .withMessage('Item base must be a numeric value')
        .custom((value: number) => {
            if (value < 0) {
                throw new Error('Item base must be greater than or equal to 0');
            }
            return true;
        }),
    check('items.*.parent')
        .notEmpty()
        .isMongoId()
        .withMessage('Item parent must be a mongo id value')
        .custom(async (value: string) => {
            // validate if parent exists on our recorss
            const product = await productService.getProductByIdOutUser(value as any);
            if (!product) {
                throw new Error(`Item parent product ${value} don´t exists in our records`);
            }
            // success validation
            return true;
        }),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
];

export {
    OrdersCreationValidator,
}
