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
const permission_middleware_1 = __importDefault(require("../middlewares/permission.middleware"));
const categories_controller_1 = require("../controllers/categories.controller");
const categories_validator_1 = require("../validators/categories.validator");
// init router
const router = (0, express_1.Router)();
exports.router = router;
// declare categories routes
const controller = new categories_controller_1.CategoriesController();
/**
 * create categories
 */
router.post('/', session_middleware_1.default, (0, permission_middleware_1.default)('create-categories'), storage_s3_1.uploadS3.single('file'), storage_s3_1.validateFileSize, categories_validator_1.CategoriesCreationValidator, subscription_middleware_1.default, controller.createCategories);
/**
 * list categories
 */
router.get('/', session_middleware_1.default, (0, permission_middleware_1.default)('list-categories'), controller.listCategories);
/**
 * create categories
 */
router.put('/:id', session_middleware_1.default, (0, permission_middleware_1.default)('update-categories'), storage_s3_1.uploadS3.single('file'), categories_validator_1.CategoryIdValidator, categories_validator_1.CategoriesCreationValidator, controller.updateCategories);
/**
 * delete categories
 */
router.delete('/:id', session_middleware_1.default, (0, permission_middleware_1.default)('update-categories'), categories_validator_1.CategoryIdValidator, subscription_middleware_1.default, controller.deleteCategories);
/**
 * list categories
 */
router.get('/list/:catalogue', controller.listCategoriesByCatalog);
