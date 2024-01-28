import  { Router} from "express";
import sessionCheck from "../middlewares/session.middleware";
import { DashboardController } from "../controllers/dashboard.controller";

// init router
const router = Router();

// controller
const controller = new DashboardController()

// load metrics
router.get(
    '/metrics',
    sessionCheck,
    controller.listMetrics,
);

// export router
export { router };