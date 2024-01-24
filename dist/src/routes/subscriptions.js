"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const session_middleware_1 = __importDefault(require("../middlewares/session.middleware"));
const plan_validator_1 = require("../validators/plan.validator");
const subscriptions_controller_1 = require("../controllers/subscriptions.controller");
const subscription_validator_1 = require("../validators/subscription.validator");
// init router
const router = (0, express_1.Router)();
exports.router = router;
// instance controller
const controller = new subscriptions_controller_1.SubscriptionController();
/**
 * Post new subscription
 */
router.post('/', session_middleware_1.default, plan_validator_1.PlanIdValidator, subscription_validator_1.CreateSubscriptionValidadotr, controller.createSubscription);
/**
 * Cancel subscription
 */
router.delete('/:id', session_middleware_1.default, subscription_validator_1.IdSubscriptionValidator, controller.cancelSubscription);
/**
 * epayco routes confirmation and response
 */
router.post('/confirmation', controller.confirmationEpayco);
/**
 * epayco routes confirmation and response
 */
router.get('/response', controller.responseEpayco);
