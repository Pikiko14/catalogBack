import  { Router} from "express";
import { upload } from "../utils/storage";
import sessionCheck from "../middlewares/session.middleware";
import perMissionMiddleware from '../middlewares/permission.middleware';
import { CatalogueController } from '../controllers/catalogues.controller';
import { CreateCatalogueValidator, IdCatalogueValidator } from "../validators/catalogues.validator";
import subscriptionCheck from "../middlewares/subscription.middleware";

// init router
const router = Router();

// instance controller
const controller = new CatalogueController();

// declare all my routes

/**
 * List catalogue
 */
router.get('/',
    sessionCheck,
    perMissionMiddleware('list-catalogues'),
    controller.listCatalogues
);

/**
 * Create catalogue
 */
router.post('/',
    sessionCheck,
    subscriptionCheck,
    perMissionMiddleware('create-catalogues'),
    upload.single('cover'),
    CreateCatalogueValidator,
    controller.createCatalogue
);

/**
 * Show catalogue
 */
router.get('/:id',
    sessionCheck,
    perMissionMiddleware('show-catalogues'),
    IdCatalogueValidator,
    controller.showCatalogue
);

/**
 * Update catalogue
 */
router.put('/:id',
    sessionCheck,
    perMissionMiddleware('update-catalogues'),
    IdCatalogueValidator,
    upload.single('cover'),
    CreateCatalogueValidator,
    controller.updateCatalogue
);

/**
 * delete catalogue
 */
router.delete('/:id',
    sessionCheck,
    subscriptionCheck,
    perMissionMiddleware('delete-catalogues'),
    IdCatalogueValidator,
    controller.deleteCatalogue
);

/**
 * Activate catalogs
 */
router.get('/activate/:id',
    sessionCheck,
    perMissionMiddleware('activate-catalog'),
    IdCatalogueValidator,
    controller.doActivateCatalog
);

// export router
export { router };