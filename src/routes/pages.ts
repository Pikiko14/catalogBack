import  { Router} from "express";
import { upload } from "../utils/storage";
import sessionCheck from "../middlewares/session.middleware";
import { IdPageValidator } from "../validators/pages.validator";
import { PagesController } from "../controllers/pages.controller";
import { PagesCreationValidator, pagesImportValdiator } from "../validators/pages.validator";
import perMissionMiddleware from '../middlewares/permission.middleware';
import { IdCatalogueValidator } from "../validators/catalogues.validator";
import subscriptionCheck from "../middlewares/subscription.middleware";

// init router
const router = Router();

// instance controller
const controller = new PagesController();

// declare all my routes

/**
 * list pages by catalogues
 */
router.get(
    '/catalogue/:id',
    sessionCheck,
    perMissionMiddleware('list-pages'),
    IdCatalogueValidator,
    controller.listPages
);

/**
 * Post new page
 */
router.post(
    '/',
    sessionCheck,
    subscriptionCheck,
    perMissionMiddleware('create-pages'),
    upload.array('file'),
    PagesCreationValidator,
    controller.createPages
);

/**
 * show one page from catalogs
 */
router.get(
    '/:id',
    sessionCheck,
    perMissionMiddleware('show-pages'),
    IdPageValidator,
    controller.showPages
);

/**
 * delete one page from catalogs
 */
router.delete(
    '/:id',
    sessionCheck,
    subscriptionCheck,
    perMissionMiddleware('delete-pages'),
    IdPageValidator,
    controller.deletePages
);

/**
 * import pages from pdf
 */
router.post(
    '/import/pdf',
    sessionCheck,
    subscriptionCheck,
    perMissionMiddleware('create-pages'),
    upload.single('file'),
    pagesImportValdiator,
    controller.importPages
);

/**
 * set button on page
 */
router.post(
    '/:id/set-buttons',
    sessionCheck,
    perMissionMiddleware('update-pages'),
    IdPageValidator,
    controller.setButtonOnpage,
);

// export router
export { router };