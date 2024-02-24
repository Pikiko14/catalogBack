"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const orders_controller_1 = require("../controllers/orders.controller");
const orders_validator_1 = require("../validators/orders.validator");
// init router
const router = (0, express_1.Router)();
exports.router = router;
// controller
const controller = new orders_controller_1.OrdersController();
/**
 * Create order
 */
router.post('/', orders_validator_1.OrdersCreationValidator, controller.createOrder);
