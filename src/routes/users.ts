import  { Router} from "express";
import sessionCheck from "../middlewares/session.middleware";
import { RegisterValidator } from "../validators/auth.validator";
import { UsersController } from "../controllers/users.controller";
import perMissionMiddleware from './../middlewares/permission.middleware';
import { UserIdValidator, UpdateUserData } from "../validators/users.validator";
import subscriptionCheck from "../middlewares/subscription.middleware";

// init router
const router = Router();

// instance controller
const controller = new UsersController();

/**
 * DO get request from user
 */
router.get(
    '/',
    sessionCheck,
    perMissionMiddleware('list-user'),
    controller.getUsers
);

/**
 * DO get request from filter user
 */
router.get(
    '/:id',
    sessionCheck,
    perMissionMiddleware('show-user'),
    UserIdValidator,
    controller.getUser
);

/**
 * DO get request from create user
 */
router.post(
    '/',
    sessionCheck,
    subscriptionCheck,
    perMissionMiddleware('create-user'),
    RegisterValidator,
    controller.storeUsers
);

/**
 * DO get request from update user
 */
router.put(
    '/:id',
    sessionCheck,
    perMissionMiddleware('update-user'),
    UserIdValidator,
    UpdateUserData,
    controller.updateUsers
);

/**
 * DO get request from delete user
 */
router.delete(
    '/:id',
    sessionCheck,
    subscriptionCheck,
    perMissionMiddleware('delete-user'),
    UserIdValidator,
    controller.deleteUsers
);

export { router };