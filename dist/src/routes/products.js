"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const session_middleware_1 = __importDefault(require("../middlewares/session.middleware"));
const storage_s3_1 = require("../utils/storage.s3");
const subscription_middleware_1 = __importDefault(require("../middlewares/subscription.middleware"));
const products_controller_1 = require("../controllers/products.controller");
const permission_middleware_1 = __importDefault(require("../middlewares/permission.middleware"));
const parseBody_middleware_1 = __importDefault(require("../middlewares/parseBody.middleware"));
const products_validator_1 = require("../validators/products.validator");
// init router
const router = (0, express_1.Router)();
exports.router = router;
// declare categories routes
const controller = new products_controller_1.ProductsController();
/**
 * List products
 */
router.get('/', session_middleware_1.default, (0, permission_middleware_1.default)('list-products'), controller.listProducts);
/**
 * Create products
 */
router.post('/', session_middleware_1.default, (0, permission_middleware_1.default)('create-products'), storage_s3_1.uploadS3.array('file'), storage_s3_1.validateFilesSize, (0, parseBody_middleware_1.default)('product'), products_validator_1.ProductCreateValidator, subscription_middleware_1.default, controller.createProducts);
/**
 * Update products
 */
router.put('/:productId', session_middleware_1.default, (0, permission_middleware_1.default)('update-products'), storage_s3_1.uploadS3.array('file'), storage_s3_1.validateFilesSize, (0, parseBody_middleware_1.default)('product'), products_validator_1.ProductUpdateValidator, controller.updateProducts);
/**
 * Delete products
 */
router.delete('/:productId', session_middleware_1.default, (0, permission_middleware_1.default)('delete-products'), subscription_middleware_1.default, controller.deleteProducts);
/**
 * show product
 */
router.get('/:productId', session_middleware_1.default, (0, permission_middleware_1.default)('list-products'), controller.showProduct);
/**
 * Set product default image
 */
router.post('/:productId/default-img', session_middleware_1.default, (0, permission_middleware_1.default)('update-products'), products_validator_1.ProductMediaDefaulValidator, controller.setDefaultImg);
/**
 * show product for front
 */
router.get('/:productId/show', controller.showProductByFront);
/**
 * added to cart products
 */
router.post('/add/to/cart', products_validator_1.ProductArrayIdValidator, controller.addProductToCart);
/**
 * search product
 */
router.get('/filter/front', controller.filterProducts);
