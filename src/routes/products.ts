import  { Router} from "express";
import { upload } from "../utils/storage";
import sessionCheck from "../middlewares/session.middleware";
import { uploadS3, validateFilesSize } from "../utils/storage.s3";
import subscriptionCheck from "../middlewares/subscription.middleware";
import { ProductsController } from "../controllers/products.controller";
import perMissionMiddleware from "../middlewares/permission.middleware";
import parseBodyAttributesToJson from "../middlewares/parseBody.middleware";
import { IdProductValidator, ProductArrayIdValidator, ProductCreateValidator, ProductMediaDefaulValidator, ProductUpdateValidator } from "../validators/products.validator";

// init router
const router = Router();

// declare categories routes
const controller = new ProductsController();

/**
 * List products
 */
router.get(
    '/',
    sessionCheck,
    perMissionMiddleware('list-products'),
    controller.listProducts,
);

/**
 * Create products
 */
router.post(
    '/',
    sessionCheck,
    perMissionMiddleware('create-products'),
    uploadS3.array('file'),
    validateFilesSize,
    parseBodyAttributesToJson('product'),
    ProductCreateValidator,
    subscriptionCheck,
    controller.createProducts,
);

/**
 * Update products
 */
router.put(
    '/:productId',
    sessionCheck,
    perMissionMiddleware('update-products'),
    uploadS3.array('file'),
    validateFilesSize,
    parseBodyAttributesToJson('product'),
    ProductUpdateValidator,
    controller.updateProducts,
);

/**
 * Delete products
 */
router.delete(
    '/:productId',
    sessionCheck,
    perMissionMiddleware('delete-products'),
    subscriptionCheck,
    controller.deleteProducts,
);

/**
 * show product
 */
router.get(
    '/:productId',
    sessionCheck,
    perMissionMiddleware('list-products'),
    controller.showProduct,
);

/**
 * Set product default image
 */
router.post(
    '/:productId/default-img',
    sessionCheck,
    perMissionMiddleware('update-products'),
    ProductMediaDefaulValidator,
    controller.setDefaultImg,
);

/**
 * show product for front
 */
router.get(
    '/:productId/show',
    controller.showProductByFront,
);

/**
 * added to cart products
 */
router.post(
    '/add/to/cart',
    ProductArrayIdValidator,
    controller.addProductToCart,
);

/**
 * search product
 */
router.get(
    '/filter/front',
    controller.filterProducts,
);

/**
 * show product data
 */
router.get(
    '/:id/show',
    IdProductValidator,
    controller.showProductById,
);

// export router
export { router };
