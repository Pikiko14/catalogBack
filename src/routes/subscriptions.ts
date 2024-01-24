import  { Router} from "express";
import sessionCheck from "../middlewares/session.middleware";
import { PlanIdValidator } from "../validators/plan.validator";
import { SubscriptionController } from "../controllers/subscriptions.controller";
import { CreateSubscriptionValidadotr, IdSubscriptionValidator } from "../validators/subscription.validator";

// init router
const router = Router();

// instance controller
const controller = new SubscriptionController();

/**
 * Post new subscription
 */
router.post(
    '/',
    sessionCheck,
    PlanIdValidator,
    CreateSubscriptionValidadotr,
    controller.createSubscription
);

/**
 * Cancel subscription
 */
router.delete(
    '/:id',
    sessionCheck,
    IdSubscriptionValidator,
    controller.cancelSubscription,
);

/**
 * epayco routes confirmation and response
 */
router.post(
    '/confirmation',
    controller.confirmationEpayco
);

/**
 * epayco routes confirmation and response
 */
router.get(
    '/response',
    controller.responseEpayco
);

// export router
export { router };
