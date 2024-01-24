"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_validator_1 = require("../validators/auth.validator");
// init router
const router = (0, express_1.Router)();
exports.router = router;
// instance controller
const controller = new auth_controller_1.AuthController();
// declare all my routes
/**
 * Do login user
 */
router.post('/login', auth_validator_1.LoginValidator, controller.loginUser);
/**
 * Do register user
 */
router.post('/register', auth_validator_1.RegisterValidator, controller.registerUser);
