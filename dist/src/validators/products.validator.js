"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductMediaDefaulValidator = exports.ProductArrayIdValidator = exports.ProductUpdateValidator = exports.validateDuplicates = exports.ProductCreateValidator = void 0;
const utils_1 = require("../utils/utils");
const handler_validator_1 = require("../utils/handler.validator");
const products_service_1 = require("./../services/products.service");
const express_validator_1 = require("express-validator");
const products_interface_1 = require("../interfaces/products.interface");
// service
const utils = new utils_1.Utils();
const productService = new products_service_1.ProductsService();
/**
 * Create products validations
 */
const ProductCreateValidator = [
    (0, express_validator_1.check)('tax')
        .optional()
        .isNumeric()
        .withMessage('Tax must be a numeric value')
        .custom((value) => {
        const numericValue = parseInt(value);
        if (isNaN(numericValue) || numericValue < 1 || numericValue > 99) {
            throw new Error('Tax must be a number between 1 and 99');
        }
        return true;
    }),
    (0, express_validator_1.check)('name')
        .notEmpty()
        .withMessage('Name cannot be empty')
        .isLength({ min: 2, max: 90 })
        .withMessage('Name must be between 2 and 90 characters'),
    (0, express_validator_1.check)('reference')
        .notEmpty()
        .withMessage('Reference cannot be empty')
        .isLength({ min: 1, max: 30 })
        .withMessage('Name must be between 2 and 90 characters')
        .custom(async (value, { req }) => {
        // get user main id
        const userId = req.user.parent || req.user._id;
        //get product by reference
        const product = await productService.getProductByReference(value, userId);
        if (product) {
            throw new Error(`Exists one product with this reference ${value}`);
        }
        return true;
    }),
    (0, express_validator_1.check)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string value')
        .isLength({ min: 2, max: 1500 })
        .withMessage('Description must be between 2 and 1500 characters'),
    (0, express_validator_1.check)('prices')
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
        prices.forEach((price, index) => {
            if (price.value === 0) {
                throw new Error(`Price value not can be 0 at price ${index + 1}`);
            }
            const validationResult = (0, express_validator_1.body)(`prices[${index}]`)
                .isObject()
                .run(req);
            if (Array.isArray(validationResult)) {
                throw new Error(`Invalid price object at price ${index}`);
            }
        });
        return true;
    }),
    (0, express_validator_1.check)('prices.*.value')
        .notEmpty()
        .withMessage('Value cannot be empty.')
        .isNumeric()
        .withMessage('Value value must be an numeric'),
    (0, express_validator_1.check)('prices.*.position')
        .notEmpty()
        .withMessage('Position cannot be empty.')
        .isNumeric()
        .withMessage('Position value must be an numeric'),
    (0, express_validator_1.check)('prices.*.status')
        .notEmpty()
        .withMessage('Status cannot be empty.')
        .isString()
        .withMessage('Status value must be an numeric')
        .custom((val) => {
        if (!Object.keys(products_interface_1.StatusPrice).includes(val)) {
            throw new Error(`Invalid status ${val}`);
        }
        return true;
    }),
    (0, express_validator_1.check)('unit_of_measurement')
        .optional()
        .notEmpty()
        .withMessage('Unit of measurement cannot be empty.')
        .isString()
        .withMessage('Unit of measurement value must be an string'),
    (0, express_validator_1.check)('variants')
        .optional()
        .isArray()
        .withMessage('Variants array must be an array')
        .notEmpty()
        .withMessage('Variants array cannot be empty')
        .custom((variants, { req }) => {
        variants.forEach((variant, index) => {
            const validationResult = (0, express_validator_1.body)(`variants[${index}]`)
                .isObject()
                .run(req);
            if (Array.isArray(validationResult)) {
                throw new Error(`Invalid price object at index ${index}`);
            }
        });
        return true;
    }),
    (0, express_validator_1.check)('variants.*.tax')
        .optional()
        .isNumeric()
        .withMessage('Variant tax must be a numeric value')
        .custom((value) => {
        const numericValue = parseInt(value);
        if (isNaN(numericValue) || numericValue < 1 || numericValue > 99) {
            throw new Error('Variant tax must be a number between 1 and 99');
        }
        return true;
    }),
    (0, express_validator_1.check)('variants.*.reference')
        .notEmpty()
        .withMessage('Variant reference cannot be empty')
        .isLength({ min: 1, max: 90 })
        .withMessage('Variant reference must be between 1 and 90 characters')
        .isString()
        .withMessage('Variant reference must be a string value')
        .custom((val, { req }) => {
        const { body } = req;
        const issetDuplciate = validateDuplicates(body.variants);
        if (issetDuplciate) {
            throw new Error(`Variant reference duplicate ${val}`);
        }
        return true;
    }),
    (0, express_validator_1.check)('variants.*.attribute')
        .notEmpty()
        .withMessage('Variant attribute cannot be empty')
        .isString()
        .withMessage('Variant attribute must be a string value')
        .isLength({ min: 1, max: 40 })
        .withMessage('Variant attribute must be between 1 and 90 characters')
        .custom((val, { req }) => {
        const { body } = req;
        const issetDuplciate = validateDuplicates(body.variants);
        if (issetDuplciate) {
            throw new Error(`Variant attribute duplicate ${val}`);
        }
        return true;
    }),
    (0, express_validator_1.check)('variants.*.prices')
        .optional()
        .isArray()
        .withMessage('Variant price must be an array')
        .notEmpty()
        .withMessage('Variant price array cannot be empty'),
    (0, express_validator_1.check)('variants.*.prices.*.value')
        .notEmpty()
        .withMessage('Value cannot be empty.')
        .isNumeric()
        .withMessage('Value value must be an numeric'),
    (0, express_validator_1.check)('variants.*.prices.*.position')
        .notEmpty()
        .withMessage('Position cannot be empty.')
        .isNumeric()
        .withMessage('Position value must be an numeric'),
    (0, express_validator_1.check)('variants.*.prices.*.status')
        .notEmpty()
        .withMessage('Status cannot be empty.')
        .isString()
        .withMessage('Status value must be an numeric')
        .custom((val) => {
        if (!Object.keys(products_interface_1.StatusPrice).includes(val)) {
            throw new Error(`Invalid status ${val}`);
        }
        return true;
    }),
    (0, express_validator_1.check)('categories')
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
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty() && req.files) {
            deleteFiles(req.files);
        }
        (0, handler_validator_1.handlerValidator)(req, res, next);
    },
];
exports.ProductCreateValidator = ProductCreateValidator;
/**
 * Update products validations
 */
const ProductUpdateValidator = [
    (0, express_validator_1.check)('tax')
        .optional()
        .isNumeric()
        .withMessage('Tax must be a numeric value')
        .custom((value) => {
        const numericValue = parseInt(value);
        if (isNaN(numericValue) || numericValue < 1 || numericValue > 99) {
            throw new Error('Tax must be a number between 1 and 99');
        }
        return true;
    }),
    (0, express_validator_1.check)('name')
        .notEmpty()
        .withMessage('Name cannot be empty')
        .isLength({ min: 2, max: 90 })
        .withMessage('Name must be between 2 and 90 characters'),
    (0, express_validator_1.check)('reference')
        .notEmpty()
        .withMessage('Reference cannot be empty')
        .isLength({ min: 1, max: 30 })
        .withMessage('Name must be between 2 and 90 characters')
        .custom(async (value, { req }) => {
        var _a;
        // get user main id
        const userId = req.user.parent || req.user._id;
        //get product by reference
        const product = await productService.getProductByReference(value, userId);
        if (product && product.id !== ((_a = req.body) === null || _a === void 0 ? void 0 : _a._id)) {
            throw new Error(`Exists one product with this reference ${value}`);
        }
        return true;
    }),
    (0, express_validator_1.check)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string value')
        .isLength({ min: 2, max: 1500 })
        .withMessage('Description must be between 2 and 1500 characters'),
    (0, express_validator_1.check)('prices')
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
        prices.forEach((price, index) => {
            if (price.value === 0) {
                throw new Error(`Price value not can be 0 at price ${index + 1}`);
            }
            const validationResult = (0, express_validator_1.body)(`prices[${index}]`)
                .isObject()
                .run(req);
            if (Array.isArray(validationResult)) {
                throw new Error(`Invalid price object at index ${index}`);
            }
        });
        return true;
    }),
    (0, express_validator_1.check)('prices.*.value')
        .notEmpty()
        .withMessage('Value cannot be empty.')
        .isNumeric()
        .withMessage('Value value must be an numeric'),
    (0, express_validator_1.check)('prices.*.position')
        .notEmpty()
        .withMessage('Position cannot be empty.')
        .isNumeric()
        .withMessage('Position value must be an numeric'),
    (0, express_validator_1.check)('prices.*.status')
        .notEmpty()
        .withMessage('Status cannot be empty.')
        .isString()
        .withMessage('Status value must be an numeric')
        .custom((val) => {
        if (!Object.keys(products_interface_1.StatusPrice).includes(val)) {
            throw new Error(`Invalid status ${val}`);
        }
        return true;
    }),
    (0, express_validator_1.check)('unit_of_measurement')
        .optional()
        .notEmpty()
        .withMessage('Unit of measurement cannot be empty.')
        .isString()
        .withMessage('Unit of measurement value must be an string'),
    (0, express_validator_1.check)('variants')
        .optional()
        .isArray()
        .withMessage('Variants array must be an array')
        .notEmpty()
        .withMessage('Variants array cannot be empty')
        .custom((variants, { req }) => {
        variants.forEach((variant, index) => {
            const validationResult = (0, express_validator_1.body)(`variants[${index}]`)
                .isObject()
                .run(req);
            if (Array.isArray(validationResult)) {
                throw new Error(`Invalid price object at index ${index}`);
            }
        });
        return true;
    }),
    (0, express_validator_1.check)('variants.*.tax')
        .optional()
        .isNumeric()
        .withMessage('Variant tax must be a numeric value')
        .custom((value) => {
        const numericValue = parseInt(value);
        if (isNaN(numericValue) || numericValue < 1 || numericValue > 99) {
            throw new Error('Variant tax must be a number between 1 and 99');
        }
        return true;
    }),
    (0, express_validator_1.check)('variants.*.reference')
        .notEmpty()
        .withMessage('Variant reference cannot be empty')
        .isLength({ min: 1, max: 90 })
        .withMessage('Variant reference must be between 1 and 90 characters')
        .isString()
        .withMessage('Variant reference must be a string value')
        .custom((val, { req }) => {
        const { body } = req;
        const issetDuplciate = validateDuplicates(body.variants);
        if (issetDuplciate) {
            throw new Error(`Variant reference duplicate ${val}`);
        }
        return true;
    }),
    (0, express_validator_1.check)('variants.*.attribute')
        .notEmpty()
        .withMessage('Variant attribute cannot be empty')
        .isString()
        .withMessage('Variant attribute must be a string value')
        .isLength({ min: 1, max: 40 })
        .withMessage('Variant attribute must be between 1 and 90 characters')
        .custom((val, { req }) => {
        const { body } = req;
        const issetDuplciate = validateDuplicates(body.variants);
        if (issetDuplciate) {
            throw new Error(`Variant attribute duplicate ${val}`);
        }
        return true;
    }),
    (0, express_validator_1.check)('variants.*.prices')
        .optional()
        .isArray()
        .withMessage('Variant price must be an array')
        .notEmpty()
        .withMessage('Variant price array cannot be empty'),
    (0, express_validator_1.check)('variants.*.prices.*.value')
        .notEmpty()
        .withMessage('Value cannot be empty.')
        .isNumeric()
        .withMessage('Value value must be an numeric'),
    (0, express_validator_1.check)('variants.*.prices.*.position')
        .notEmpty()
        .withMessage('Position cannot be empty.')
        .isNumeric()
        .withMessage('Position value must be an numeric'),
    (0, express_validator_1.check)('variants.*.prices.*.status')
        .notEmpty()
        .withMessage('Status cannot be empty.')
        .isString()
        .withMessage('Status value must be an numeric')
        .custom((val) => {
        if (!Object.keys(products_interface_1.StatusPrice).includes(val)) {
            throw new Error(`Invalid status ${val}`);
        }
        return true;
    }),
    (0, express_validator_1.check)('categories')
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
    (0, express_validator_1.check)('medias')
        .optional(),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty() && req.files) {
            deleteFiles(req.files);
        }
        (0, handler_validator_1.handlerValidator)(req, res, next);
    },
];
exports.ProductUpdateValidator = ProductUpdateValidator;
/**
 * default image validator
 */
const ProductMediaDefaulValidator = [
    (0, express_validator_1.check)('deleted').isBoolean(),
    (0, express_validator_1.check)('path').isString().notEmpty(),
    (0, express_validator_1.check)('provider').isString().notEmpty(),
    (0, express_validator_1.check)('type').isString().notEmpty(),
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
];
exports.ProductMediaDefaulValidator = ProductMediaDefaulValidator;
/**
 * Validate array id products
 */
const ProductArrayIdValidator = [
    (0, express_validator_1.check)('products')
        .optional()
        .isArray()
        .withMessage('products must be a array value')
        .custom(async (values) => {
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
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
];
exports.ProductArrayIdValidator = ProductArrayIdValidator;
// validate references duplicates
function validateDuplicates(arr) {
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
exports.validateDuplicates = validateDuplicates;
// delete files if have error
async function deleteFiles(files) {
    for (const file of files) {
        await utils.deleteItemFromStorage(`products/${file.filename}`);
    }
}
