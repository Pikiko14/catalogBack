"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const storage_1 = require("../utils/storage");
const session_middleware_1 = __importDefault(require("../middlewares/session.middleware"));
const pages_validator_1 = require("../validators/pages.validator");
const pages_controller_1 = require("../controllers/pages.controller");
const pages_validator_2 = require("../validators/pages.validator");
const permission_middleware_1 = __importDefault(require("../middlewares/permission.middleware"));
const catalogues_validator_1 = require("../validators/catalogues.validator");
const subscription_middleware_1 = __importDefault(require("../middlewares/subscription.middleware"));
// init router
const router = (0, express_1.Router)();
exports.router = router;
// instance controller
const controller = new pages_controller_1.PagesController();
// declare all my routes
/**
 * list pages by catalogues
 */
router.get('/catalogue/:id', session_middleware_1.default, (0, permission_middleware_1.default)('list-pages'), catalogues_validator_1.IdCatalogueValidator, controller.listPages);
/**
 * Post new page
 */
router.post('/', session_middleware_1.default, subscription_middleware_1.default, (0, permission_middleware_1.default)('create-pages'), storage_1.upload.array('file'), pages_validator_2.PagesCreationValidator, controller.createPages);
/**
 * show one page from catalogs
 */
router.get('/:id', session_middleware_1.default, (0, permission_middleware_1.default)('show-pages'), pages_validator_1.IdPageValidator, controller.showPages);
/**
 * delete one page from catalogs
 */
router.delete('/:id', session_middleware_1.default, subscription_middleware_1.default, (0, permission_middleware_1.default)('delete-pages'), pages_validator_1.IdPageValidator, controller.deletePages);
/**
 * import pages from pdf
 */
router.post('/import/pdf', session_middleware_1.default, subscription_middleware_1.default, (0, permission_middleware_1.default)('create-pages'), storage_1.upload.single('file'), pages_validator_2.pagesImportValdiator, controller.importPages);
/**
 * set button on page
 */
router.post('/:id/set-buttons', session_middleware_1.default, (0, permission_middleware_1.default)('update-pages'), pages_validator_1.IdPageValidator, controller.setButtonOnpage);
