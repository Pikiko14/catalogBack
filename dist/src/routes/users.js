"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const session_middleware_1 = __importDefault(require("../middlewares/session.middleware"));
const auth_validator_1 = require("../validators/auth.validator");
const users_controller_1 = require("../controllers/users.controller");
const permission_middleware_1 = __importDefault(require("./../middlewares/permission.middleware"));
const users_validator_1 = require("../validators/users.validator");
const subscription_middleware_1 = __importDefault(require("../middlewares/subscription.middleware"));
// init router
const router = (0, express_1.Router)();
exports.router = router;
// instance controller
const controller = new users_controller_1.UsersController();
/**
 * DO get request from user
 */
router.get('/', session_middleware_1.default, (0, permission_middleware_1.default)('list-user'), controller.getUsers);
/**
 * DO get request from filter user
 */
router.get('/:id', session_middleware_1.default, (0, permission_middleware_1.default)('show-user'), users_validator_1.UserIdValidator, controller.getUser);
/**
 * DO get request from create user
 */
router.post('/', session_middleware_1.default, subscription_middleware_1.default, (0, permission_middleware_1.default)('create-user'), auth_validator_1.RegisterValidator, controller.storeUsers);
/**
 * DO get request from update user
 */
router.put('/:id', session_middleware_1.default, (0, permission_middleware_1.default)('update-user'), users_validator_1.UserIdValidator, users_validator_1.UpdateUserData, controller.updateUsers);
/**
 * DO get request from delete user
 */
router.delete('/:id', session_middleware_1.default, subscription_middleware_1.default, (0, permission_middleware_1.default)('delete-user'), users_validator_1.UserIdValidator, controller.deleteUsers);
