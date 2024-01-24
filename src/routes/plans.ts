import  { Router } from "express";
import sessionCheck from "../middlewares/session.middleware";
import { PlanController } from "../controllers/plans.controller";
import perMissionMiddleware from '../middlewares/permission.middleware';
import { PlanCreationValidator, IdPlanValidator } from "../validators/plan.validator";

// instance controller
const router = Router();
const controller = new PlanController();

 /**
 * Post new plan
 */
router.post(
    '/',
    sessionCheck,
    perMissionMiddleware('create-plan'),
    PlanCreationValidator,
    controller.createPlan
);

/**
 * list plans
 */
router.get(
    '/',
    controller.listPlans
);

 /**
 * show plan
 */
 router.get(
    '/:id',
    sessionCheck,
    perMissionMiddleware('list-plan'),
    IdPlanValidator,
    controller.showPlan
);

/**
 * put plan
 */
router.put(
    '/:id',
    sessionCheck,
    perMissionMiddleware('update-plan'),
    IdPlanValidator,
    PlanCreationValidator,
    controller.updatePlan
);

/**
 * delete plan
 */
router.delete(
    '/:id',
    sessionCheck,
    perMissionMiddleware('delete-plan'),
    IdPlanValidator,
    controller.deletePlan
);

export { router };