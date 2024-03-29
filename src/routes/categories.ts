import  { Router} from "express";
import { upload } from "../utils/storage";
import sessionCheck from "../middlewares/session.middleware";
import { uploadS3, validateFileSize } from "../utils/storage.s3";
import subscriptionCheck from "../middlewares/subscription.middleware";
import perMissionMiddleware from "../middlewares/permission.middleware";
import { CategoriesController } from "../controllers/categories.controller";
import { CategoriesCreationValidator, CategoryIdValidator } from "../validators/categories.validator";

// init router
const router = Router();

// declare categories routes
const controller = new CategoriesController();

/**
 * create categories
 */
router.post(
    '/',
    sessionCheck,
    perMissionMiddleware('create-categories'),
    uploadS3.single('file'),
    validateFileSize,
    CategoriesCreationValidator,
    subscriptionCheck,
    controller.createCategories,
);

/**
 * list categories
 */
router.get(
    '/',
    sessionCheck,
    perMissionMiddleware('list-categories'),
    controller.listCategories,
);

/**
 * create categories
 */
router.put(
    '/:id',
    sessionCheck,
    perMissionMiddleware('update-categories'),
    uploadS3.single('file'),
    CategoryIdValidator,
    CategoriesCreationValidator,
    controller.updateCategories,
);

/**
 * delete categories
 */
router.delete(
    '/:id',
    sessionCheck,
    perMissionMiddleware('update-categories'),
    CategoryIdValidator,
    subscriptionCheck,
    controller.deleteCategories,
);

/**
 * list categories
 */
router.get(
    '/list/:catalogue',
    controller.listCategoriesByCatalog,
);


// export router
export { router };