import  { Router} from "express";
import { OrdersController } from "../controllers/orders.controller";
import { OrdersCreationValidator } from "../validators/orders.validator";

// init router
const router = Router();

// controller
const controller = new OrdersController();

/**
 * Create order
 */
router.post(
    '/',
    OrdersCreationValidator,
    controller.createOrder,
);

// export router
export { router };