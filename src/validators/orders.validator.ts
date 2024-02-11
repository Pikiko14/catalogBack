import { check } from "express-validator";
import { NextFunction, Response, Request } from "express";
import { handlerValidator } from "../utils/handler.validator";
import { ClientInterface } from "../interfaces/orders.interface";

const OrdersCreationValidator = [
    check('client')
        .notEmpty()
        .withMessage('Order client is required')
        .custom((client: ClientInterface) => {
            if (typeof client !== 'object') {
                throw new Error('Order client must be object');
            }
            return true;
        }),
    check('client.name')
        .notEmpty()
        .withMessage('Client name is required')
        .isLength({ min: 3, max: 60 })
        .withMessage('Client name must have a minimum of 3 characters and a maximum of 60.'),
    check('client.last_name')
        .notEmpty()
        .withMessage('Client last name is required')
        .isLength({ min: 3, max: 60 })
        .withMessage('Client last name must have a minimum of 3 characters and a maximum of 60.'),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
];

export {
    OrdersCreationValidator,
}
