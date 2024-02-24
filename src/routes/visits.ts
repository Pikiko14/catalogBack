import  { Router} from "express";
import { VisitsController } from "../controllers/visits.controller";
import { VisitCreationValidator } from "../validators/visits.validator";

// init router
const router = Router();

// controller
const controller = new VisitsController();

/**
 * Create visit
 */
router.post(
    '/',
    VisitCreationValidator,
    controller.createVisit,
);

// export router
export { router };