"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitCreationValidator = void 0;
const express_validator_1 = require("express-validator");
const handler_validator_1 = require("../utils/handler.validator");
const catalogues_service_1 = require("../services/catalogues.service");
const users_service_1 = require("../services/users.service");
// services instances
const userService = new users_service_1.UserService();
const catalogueService = new catalogues_service_1.CatalogueService();
// creation valdiator
const VisitCreationValidator = [
    (0, express_validator_1.check)('city')
        .notEmpty()
        .withMessage('City is required'),
    (0, express_validator_1.check)('country')
        .notEmpty()
        .withMessage('Country is required'),
    (0, express_validator_1.check)('ip')
        .notEmpty()
        .withMessage('IP is required'),
    (0, express_validator_1.check)('loc')
        .notEmpty()
        .withMessage('Loc is required'),
    (0, express_validator_1.check)('org')
        .notEmpty()
        .withMessage('Org is required'),
    (0, express_validator_1.check)('postal')
        .notEmpty()
        .withMessage('Postal is required'),
    (0, express_validator_1.check)('region')
        .notEmpty()
        .withMessage('Region is required'),
    (0, express_validator_1.check)('timezone')
        .notEmpty()
        .withMessage('Timezone is required'),
    (0, express_validator_1.check)('catalogue_id')
        .notEmpty()
        .withMessage('Catalogue ID is required')
        .isMongoId()
        .withMessage('User id must be a mongo id')
        .custom(async (value) => {
        // validate if parent exists on our recorss
        const catalogue = await catalogueService.findById(value);
        if (!catalogue) {
            throw new Error(`Catalogue id ${value} don´t exists in our records`);
        }
        // success validation
        return true;
    }),
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
];
exports.VisitCreationValidator = VisitCreationValidator;
