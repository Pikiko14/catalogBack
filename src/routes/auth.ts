import  { Router} from "express";
import { AuthController } from "../controllers/auth.controller";
import { RegisterValidator, LoginValidator } from "../validators/auth.validator";

// init router
const router = Router();

// instance controller
const controller = new AuthController();

// declare all my routes

/**
 * Do login user
 */
router.post(
    '/login',
    LoginValidator,
    controller.loginUser
);

/**
 * Do register user
 */
router.post(
    '/register',
    RegisterValidator,
    controller.registerUser
);

// export router
export { router };