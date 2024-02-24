"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const session_middleware_1 = __importDefault(require("../middlewares/session.middleware"));
const dashboard_controller_1 = require("../controllers/dashboard.controller");
// init router
const router = (0, express_1.Router)();
exports.router = router;
// controller
const controller = new dashboard_controller_1.DashboardController();
// load metrics
router.get('/metrics', session_middleware_1.default, controller.listMetrics);
