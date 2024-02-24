"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const visits_controller_1 = require("../controllers/visits.controller");
const visits_validator_1 = require("../validators/visits.validator");
// init router
const router = (0, express_1.Router)();
exports.router = router;
// controller
const controller = new visits_controller_1.VisitsController();
/**
 * Create visit
 */
router.post('/', visits_validator_1.VisitCreationValidator, controller.createVisit);
