import { check } from "express-validator";
import { NextFunction, Response, Request } from "express";
import { handlerValidator } from "../utils/handler.validator";
import { CatalogueService } from "../services/catalogues.service";
import { UserService } from "../services/users.service";

// services instances
const userService = new UserService();
const catalogueService = new CatalogueService();

// creation valdiator
const VisitCreationValidator = [
    check('city')
        .notEmpty()
        .withMessage('City is required'),
    check('country')
        .notEmpty()
        .withMessage('Country is required'),
    check('ip')
        .notEmpty()
        .withMessage('IP is required'),
    check('loc')
        .notEmpty()
        .withMessage('Loc is required'),
    check('org')
        .notEmpty()
        .withMessage('Org is required'),
    check('postal')
        .notEmpty()
        .withMessage('Postal is required'),
    check('region')
        .notEmpty()
        .withMessage('Region is required'),
    check('timezone')
        .notEmpty()
        .withMessage('Timezone is required'),
    check('catalogue_id')
        .notEmpty()
        .withMessage('Catalogue ID is required')
        .isMongoId()
        .withMessage('User id must be a mongo id')
        .custom(async (value: string) => {
            // validate if parent exists on our recorss
            const catalogue = await catalogueService.findById(value);
            if (!catalogue) {
                throw new Error(`Catalogue id ${value} don´t exists in our records`);
            }
            // success validation
            return true;
        }),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
];

export {
    VisitCreationValidator,
}
