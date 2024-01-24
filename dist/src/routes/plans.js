"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const session_middleware_1 = __importDefault(require("../middlewares/session.middleware"));
const plans_controller_1 = require("../controllers/plans.controller");
const permission_middleware_1 = __importDefault(require("../middlewares/permission.middleware"));
const plan_validator_1 = require("../validators/plan.validator");
// instance controller
const router = (0, express_1.Router)();
exports.router = router;
const controller = new plans_controller_1.PlanController();
/**
* Post new plan
*/
router.post('/', session_middleware_1.default, (0, permission_middleware_1.default)('create-plan'), plan_validator_1.PlanCreationValidator, controller.createPlan);
/**
 * list plans
 */
router.get('/', controller.listPlans);
/**
* show plan
*/
router.get('/:id', session_middleware_1.default, (0, permission_middleware_1.default)('list-plan'), plan_validator_1.IdPlanValidator, controller.showPlan);
/**
 * put plan
 */
router.put('/:id', session_middleware_1.default, (0, permission_middleware_1.default)('update-plan'), plan_validator_1.IdPlanValidator, plan_validator_1.PlanCreationValidator, controller.updatePlan);
/**
 * delete plan
 */
router.delete('/:id', session_middleware_1.default, (0, permission_middleware_1.default)('delete-plan'), plan_validator_1.IdPlanValidator, controller.deletePlan);
