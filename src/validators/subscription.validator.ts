import { check } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { handlerValidator } from '../utils/handler.validator';
import { BillingPeriod } from '../interfaces/subscriptions.interface';

// create subscription data
const CreateSubscriptionValidadotr = [
    check('auto_renew')
    .exists()
    .isBoolean()
    .withMessage('Auto renew is empty or not a boolean'),
    check('billing_period')
    .exists()
    .withMessage('Billing period is required')
    .custom(async (billing_period: any) => {
        const enumEntries = Object.values(BillingPeriod);
        if (!enumEntries.includes(billing_period)) {
            throw new Error(`Type billing_period be in (${enumEntries})`);
        }
        return true;
    }),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
]

/**
 * validate subscription id
 */
const IdSubscriptionValidator = [
    check('id')
    .exists()
    .notEmpty()
    .withMessage('Subscription id is empty or dont exists')
    .isString()
    .withMessage('Subscription id is not mongo id'),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
];

export {
    CreateSubscriptionValidadotr,
    IdSubscriptionValidator,
}