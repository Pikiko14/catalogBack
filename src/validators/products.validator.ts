import { Utils } from '../utils/utils';
import { Request, Response, NextFunction } from 'express';
import { handlerValidator } from '../utils/handler.validator';
import { ProductsService } from './../services/products.service';
import { check, ValidationChain, body, validationResult } from "express-validator";
import { ProductInterface, StatusPrice } from '../interfaces/products.interface';

// service
const utils = new Utils();
const productService = new ProductsService();

/**
 * Create products validations
 */
const ProductCreateValidator = [
    check('tax')
        .optional()
        .isNumeric()
        .withMessage('Tax must be a numeric value')
        .custom((value: string) => {
            const numericValue = parseInt(value);
            if (isNaN(numericValue) || numericValue < 1 || numericValue > 99) {
                throw new Error('Tax must be a number between 1 and 99');
            }
            return true;
        }),
    check('name')
        .notEmpty()
        .withMessage('Name cannot be empty')
        .isLength({ min: 2, max: 90 })
        .withMessage('Name must be between 2 and 90 characters'),
    check('reference')
        .notEmpty()
        .withMessage('Reference cannot be empty')
        .isLength({ min: 1, max: 30 })
        .withMessage('Name must be between 2 and 90 characters')
        .custom(async (value: string, { req }) => {
            // get user main id
            const userId: string = req.user.parent || req.user._id
            //get product by reference
            const product = await productService.getProductByReference(value, userId);
            if (product) {
                throw new Error(`Exists one product with this reference ${value}`);
            }
            return true;
        }),
    check('description')
        .optional()
        .isString()
        .withMessage('Description must be a string value')
        .isLength({ min: 2, max: 1500 })
        .withMessage('Description must be between 2 and 1500 characters'),
    check('prices')
        .notEmpty()
        .withMessage('Prices array cannot be empty')
        .isArray()
        .withMessage('Prices array must be an array')
        .notEmpty()
        .withMessage('Prices array cannot be empty')
        .custom((prices, { req }) => {
            if (prices.length === 0) {
                throw new Error(`The price array cant't be null.`);
            }
            prices.forEach((price: any, index: number) => {
                if (price.value === 0) {
                    throw new Error(`Price value not can be 0 at price ${index + 1}`);
                }
                const validationResult = body(`prices[${index}]`)
                .isObject()
                .run(req);
                if (Array.isArray(validationResult)) {
                    throw new Error(`Invalid price object at price ${index}`);
                }
            });
          return true;
        }),
    check('prices.*.value')
        .notEmpty()
        .withMessage('Value cannot be empty.')
        .isNumeric()
        .withMessage('Value value must be an numeric'),
    check('prices.*.position')
        .notEmpty()
        .withMessage('Position cannot be empty.')
        .isNumeric()
        .withMessage('Position value must be an numeric'),
    check('prices.*.status')
        .notEmpty()
        .withMessage('Status cannot be empty.')
        .isString()
        .withMessage('Status value must be an numeric')
        .custom((val: string) => {
            if (!Object.keys(StatusPrice).includes(val)) {
                throw new Error(`Invalid status ${val}`);
            }
            return true;
        }),
    check('unit_of_measurement')
        .optional()
        .notEmpty()
        .withMessage('Unit of measurement cannot be empty.')
        .isString()
        .withMessage('Unit of measurement value must be an string'),
    check('variants')
        .optional()
        .isArray()
        .withMessage('Variants array must be an array')
        .notEmpty()
        .withMessage('Variants array cannot be empty')
        .custom((variants, { req }) => {
            variants.forEach((variant: any, index: number) => {
                const validationResult = body(`variants[${index}]`)
                .isObject()
                .run(req);
                if (Array.isArray(validationResult)) {
                    throw new Error(`Invalid price object at index ${index}`);
                }
            });
            return true;
        }),
    check('variants.*.tax')
        .optional()
        .isNumeric()
        .withMessage('Variant tax must be a numeric value')
        .custom((value: string) => {
            const numericValue = parseInt(value);
            if (isNaN(numericValue) || numericValue < 1 || numericValue > 99) {
                throw new Error('Variant tax must be a number between 1 and 99');
            }
            return true;
        }),
    check('variants.*.reference')
        .notEmpty()
        .withMessage('Variant reference cannot be empty')
        .isLength({ min: 1, max: 90 })
        .withMessage('Variant reference must be between 1 and 90 characters')
        .isString()
        .withMessage('Variant reference must be a string value')
        .custom((val: string, { req }) => {
            const { body } = req;
            const issetDuplciate = validateDuplicates(body.variants);
            if (issetDuplciate) {
                throw new Error(`Variant reference duplicate ${val}`);
            }
            return true;
        }),
    check('variants.*.attribute')
        .notEmpty()
        .withMessage('Variant attribute cannot be empty')
        .isString()
        .withMessage('Variant attribute must be a string value')
        .isLength({ min: 1, max: 40 })
        .withMessage('Variant attribute must be between 1 and 90 characters')
        .custom((val: string, { req }) => {
            const { body } = req;
            const issetDuplciate = validateDuplicates(body.variants);
            if (issetDuplciate) {
            throw new Error(`Variant attribute duplicate ${val}`);
            }
            return true;
        }),
    check('variants.*.prices')
        .optional()
        .isArray()
        .withMessage('Variant price must be an array')
        .notEmpty()
        .withMessage('Variant price array cannot be empty'),
    check('variants.*.prices.*.value')
        .notEmpty()
        .withMessage('Value cannot be empty.')
        .isNumeric()
        .withMessage('Value value must be an numeric'),
    check('variants.*.prices.*.position')
        .notEmpty()
        .withMessage('Position cannot be empty.')
        .isNumeric()
        .withMessage('Position value must be an numeric'),
    check('variants.*.prices.*.status')
        .notEmpty()
        .withMessage('Status cannot be empty.')
        .isString()
        .withMessage('Status value must be an numeric')
        .custom((val: string) => {
            if (!Object.keys(StatusPrice).includes(val)) {
                throw new Error(`Invalid status ${val}`);
            }
            return true;
        }),
    check('categories')
        .isArray()
        .withMessage('Categories array must be an array')
        .notEmpty()
        .withMessage('Categories array cannot be empty')
        .custom((categories, { req }) => {
            if (categories.length === 0) {
                throw new Error(`The price array cant't be null.`);
            }
            return true;
        }),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty() && req.files) {
            deleteFiles(req.files);
        }
        handlerValidator(req, res, next);
    },
];

/**
 * Update products validations
 */
const ProductUpdateValidator = [
    check('tax')
        .optional()
        .isNumeric()
        .withMessage('Tax must be a numeric value')
        .custom((value: string) => {
            const numericValue = parseInt(value);
            if (isNaN(numericValue) || numericValue < 1 || numericValue > 99) {
                throw new Error('Tax must be a number between 1 and 99');
            }
            return true;
        }),
    check('name')
        .notEmpty()
        .withMessage('Name cannot be empty')
        .isLength({ min: 2, max: 90 })
        .withMessage('Name must be between 2 and 90 characters'),
    check('reference')
        .notEmpty()
        .withMessage('Reference cannot be empty')
        .isLength({ min: 1, max: 30 })
        .withMessage('Name must be between 2 and 90 characters')
        .custom(async (value: string, { req }) => {
            // get user main id
            const userId: string = req.user.parent || req.user._id
            //get product by reference
            const product = await productService.getProductByReference(value, userId);
            if (product && product.id !== req.body?._id) {
                throw new Error(`Exists one product with this reference ${value}`);
            }
            return true;
        }),
    check('description')
        .optional()
        .isString()
        .withMessage('Description must be a string value')
        .isLength({ min: 2, max: 1500 })
        .withMessage('Description must be between 2 and 1500 characters'),
    check('prices')
        .notEmpty()
        .withMessage('Prices array cannot be empty')
        .isArray()
        .withMessage('Prices array must be an array')
        .notEmpty()
        .withMessage('Prices array cannot be empty')
        .custom((prices, { req }) => {
            if (prices.length === 0) {
                throw new Error(`The price array cant't be null.`);
            }
            prices.forEach((price: any, index: number) => {
                if (price.value === 0) {
                    throw new Error(`Price value not can be 0 at price ${index + 1}`);
                }
                const validationResult = body(`prices[${index}]`)
                .isObject()
                .run(req);
                if (Array.isArray(validationResult)) {
                    throw new Error(`Invalid price object at index ${index}`);
                }
            });
          return true;
        }),
    check('prices.*.value')
        .notEmpty()
        .withMessage('Value cannot be empty.')
        .isNumeric()
        .withMessage('Value value must be an numeric'),
    check('prices.*.position')
        .notEmpty()
        .withMessage('Position cannot be empty.')
        .isNumeric()
        .withMessage('Position value must be an numeric'),
    check('prices.*.status')
        .notEmpty()
        .withMessage('Status cannot be empty.')
        .isString()
        .withMessage('Status value must be an numeric')
        .custom((val: string) => {
            if (!Object.keys(StatusPrice).includes(val)) {
                throw new Error(`Invalid status ${val}`);
            }
            return true;
        }),
    check('unit_of_measurement')
        .optional()
        .notEmpty()
        .withMessage('Unit of measurement cannot be empty.')
        .isString()
        .withMessage('Unit of measurement value must be an string'),
    check('variants')
        .optional()
        .isArray()
        .withMessage('Variants array must be an array')
        .notEmpty()
        .withMessage('Variants array cannot be empty')
        .custom((variants, { req }) => {
            variants.forEach((variant: any, index: number) => {
                const validationResult = body(`variants[${index}]`)
                .isObject()
                .run(req);
                if (Array.isArray(validationResult)) {
                    throw new Error(`Invalid price object at index ${index}`);
                }
            });
            return true;
        }),
    check('variants.*.tax')
        .optional()
        .isNumeric()
        .withMessage('Variant tax must be a numeric value')
        .custom((value: string) => {
            const numericValue = parseInt(value);
            if (isNaN(numericValue) || numericValue < 1 || numericValue > 99) {
                throw new Error('Variant tax must be a number between 1 and 99');
            }
            return true;
        }),
    check('variants.*.reference')
        .notEmpty()
        .withMessage('Variant reference cannot be empty')
        .isLength({ min: 1, max: 90 })
        .withMessage('Variant reference must be between 1 and 90 characters')
        .isString()
        .withMessage('Variant reference must be a string value')
        .custom((val: string, { req }) => {
            const { body } = req;
            const issetDuplciate = validateDuplicates(body.variants);
            if (issetDuplciate) {
                throw new Error(`Variant reference duplicate ${val}`);
            }
            return true;
        }),
    check('variants.*.attribute')
        .notEmpty()
        .withMessage('Variant attribute cannot be empty')
        .isString()
        .withMessage('Variant attribute must be a string value')
        .isLength({ min: 1, max: 40 })
        .withMessage('Variant attribute must be between 1 and 90 characters')
        .custom((val: string, { req }) => {
            const { body } = req;
            const issetDuplciate = validateDuplicates(body.variants);
            if (issetDuplciate) {
            throw new Error(`Variant attribute duplicate ${val}`);
            }
            return true;
        }),
    check('variants.*.prices')
        .optional()
        .isArray()
        .withMessage('Variant price must be an array')
        .notEmpty()
        .withMessage('Variant price array cannot be empty'),
    check('variants.*.prices.*.value')
        .notEmpty()
        .withMessage('Value cannot be empty.')
        .isNumeric()
        .withMessage('Value value must be an numeric'),
    check('variants.*.prices.*.position')
        .notEmpty()
        .withMessage('Position cannot be empty.')
        .isNumeric()
        .withMessage('Position value must be an numeric'),
    check('variants.*.prices.*.status')
        .notEmpty()
        .withMessage('Status cannot be empty.')
        .isString()
        .withMessage('Status value must be an numeric')
        .custom((val: string) => {
            if (!Object.keys(StatusPrice).includes(val)) {
                throw new Error(`Invalid status ${val}`);
            }
            return true;
        }),
    check('categories')
        .isArray()
        .withMessage('Categories array must be an array')
        .notEmpty()
        .withMessage('Categories array cannot be empty')
        .custom((categories, { req }) => {
            if (categories.length === 0) {
                throw new Error(`The price array cant't be null.`);
            }
            return true;
        }),
    check('medias')
    .optional(),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty() && req.files) {
            deleteFiles(req.files);
        }
        handlerValidator(req, res, next);
    },
];

/**
 * default image validator
 */
const ProductMediaDefaulValidator = [
    check('deleted').isBoolean(),
    check('path').isString().notEmpty(),
    check('provider').isString().notEmpty(),
    check('type').isString().notEmpty(),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
];

/**
 * Validate array id products
 */
const ProductArrayIdValidator = [
    check('products')
        .optional()
        .isArray()
        .withMessage('products must be a array value')
        .custom(async (values: string[]) => {
            // valdiate if is array products id
            if (typeof values !== 'object') {
                throw new Error('Product must be a product id array');
            }
            // validate if item in array is string
            for (const productId of values) {
                const issetProduct = await productService.getProductByIdOutUser(productId);
                if (!issetProduct) {
                    throw new Error(`Product id ${productId} don´t exists on our record`);
                }
            }
            return true;
        }),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
];

/**
 * Validate product in exists
 */
const IdProductValidator = [
    check('id')
        .notEmpty()
        .isMongoId()
        .withMessage('products must be a valid id value')
        .custom(async (val: string) => {
            // validate if item in array is string
            const issetProduct = await productService.getProductByIdOutUser(val);
            if (!issetProduct) {
                throw new Error(`Product id ${val} don´t exists on our record`);
            }
            return true;
        }),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
];

// validate references duplicates
function validateDuplicates(arr: any) {
    const seenReferences = new Set();
    for (const object of arr) {
        const reference = object.reference;
        // Check if the reference is already in the set
        if (seenReferences.has(reference)) {
            return true; // Duplicate value found
        }
        // Add the reference to the set
        seenReferences.add(reference);
    }
    return false; // No duplicate values found
}

// delete files if have error
async function deleteFiles(files: any) {
    for (const file of files) {
        await utils.deleteItemFromStorage(`products/${file.filename}`);
    }
}


export {
    ProductCreateValidator,
    validateDuplicates,
    IdProductValidator,
    ProductUpdateValidator,
    ProductArrayIdValidator,
    ProductMediaDefaulValidator,
}