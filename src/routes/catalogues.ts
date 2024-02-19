import  { Router} from "express";
import { upload } from "../utils/storage";
import { uploadS3 } from "../utils/storage.s3";
import sessionCheck from "../middlewares/session.middleware";
import subscriptionCheck from "../middlewares/subscription.middleware";
import perMissionMiddleware from '../middlewares/permission.middleware';
import { CatalogueController } from '../controllers/catalogues.controller';
import { CreateCatalogueValidator, EmailValidator, IdCatalogueValidator } from "../validators/catalogues.validator";

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
    uploadS3.single('cover'),
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
    uploadS3.single('cover'),
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

/**
 * list  catalogs fron clients
 */
router.get('/show/:id',
    IdCatalogueValidator,
    controller.doListCatalog,
);

/**
 * download pdf and send email
 */
router.post('/download/pdf',
    IdCatalogueValidator,
    EmailValidator,
    controller.downloadPdfAndSendEmail,
);

// export router
export { router };