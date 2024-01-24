"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdSubscriptionValidator = exports.CreateSubscriptionValidadotr = void 0;
const express_validator_1 = require("express-validator");
const handler_validator_1 = require("../utils/handler.validator");
const subscriptions_interface_1 = require("../interfaces/subscriptions.interface");
// create subscription data
const CreateSubscriptionValidadotr = [
    (0, express_validator_1.check)('auto_renew')
        .exists()
        .isBoolean()
        .withMessage('Auto renew is empty or not a boolean'),
    (0, express_validator_1.check)('billing_period')
        .exists()
        .withMessage('Billing period is required')
        .custom(async (billing_period) => {
        const enumEntries = Object.values(subscriptions_interface_1.BillingPeriod);
        if (!enumEntries.includes(billing_period)) {
            throw new Error(`Type billing_period be in (${enumEntries})`);
        }
    }),
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
];
exports.CreateSubscriptionValidadotr = CreateSubscriptionValidadotr;
/**
 * validate subscription id
 */
const IdSubscriptionValidator = [
    (0, express_validator_1.check)('id')
        .exists()
        .notEmpty()
        .withMessage('Subscription id is empty or dont exists')
        .isString()
        .withMessage('Subscription id is not mongo id'),
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
];
exports.IdSubscriptionValidator = IdSubscriptionValidator;
