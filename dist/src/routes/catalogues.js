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
const catalogues_controller_1 = require("../controllers/catalogues.controller");
const catalogActive_middleware_1 = __importDefault(require("../middlewares/catalogActive.middleware"));
const catalogues_validator_1 = require("../validators/catalogues.validator");
// init router
const router = (0, express_1.Router)();
exports.router = router;
// instance controller
const controller = new catalogues_controller_1.CatalogueController();
// declare all my routes
/**
 * List catalogue
 */
router.get('/', session_middleware_1.default, (0, permission_middleware_1.default)('list-catalogues'), controller.listCatalogues);
/**
 * Create catalogue
 */
router.post('/', session_middleware_1.default, (0, permission_middleware_1.default)('create-catalogues'), storage_s3_1.uploadS3.single('cover'), storage_s3_1.validateFileSize, subscription_middleware_1.default, catalogues_validator_1.CreateCatalogueValidator, controller.createCatalogue);
/**
 * Show catalogue
 */
router.get('/:id', session_middleware_1.default, (0, permission_middleware_1.default)('show-catalogues'), catalogues_validator_1.IdCatalogueValidator, controller.showCatalogue);
/**
 * Update catalogue
 */
router.put('/:id', session_middleware_1.default, (0, permission_middleware_1.default)('update-catalogues'), catalogues_validator_1.IdCatalogueValidator, storage_s3_1.uploadS3.single('cover'), storage_s3_1.validateFileSize, catalogues_validator_1.CreateCatalogueValidator, controller.updateCatalogue);
/**
 * delete catalogue
 */
router.delete('/:id', session_middleware_1.default, subscription_middleware_1.default, (0, permission_middleware_1.default)('delete-catalogues'), catalogues_validator_1.IdCatalogueValidator, controller.deleteCatalogue);
/**
 * Activate catalogs
 */
router.get('/activate/:id', session_middleware_1.default, (0, permission_middleware_1.default)('activate-catalog'), catalogues_validator_1.IdCatalogueValidator, controller.doActivateCatalog);
/**
 * list  catalogs fron clients
 */
router.get('/show/:id', catalogues_validator_1.IdCatalogueValidator, catalogActive_middleware_1.default, controller.doListCatalog);
/**
 * download pdf and send email
 */
router.post('/download/pdf', catalogues_validator_1.IdCatalogueValidator, catalogues_validator_1.EmailValidator, controller.downloadPdfAndSendEmail);
