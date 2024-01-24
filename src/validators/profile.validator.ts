import { check } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { handlerValidator } from '../utils/handler.validator';
import { ProfileService } from '../services/profiles.service';
import { ProfileInterface, TypeSlider } from '../interfaces/profile.interface';
import { UserService } from '../services/users.service.';
import { ObjectId } from 'mongodb';

// service
const userService = new UserService();
const profileService = new ProfileService();

// validate profile data
const updateProfileValidator = [
    check('brand_name')
        .optional()
        .isString()
        .withMessage('Brand name must be string')
        .isLength({ min: 2, max: 60 })
        .withMessage('Brand name must be min 2 characters and max 60 characters')
        .custom(async (value: string, { req }) => {
            const { user_id } = req.body; // get param user to edit
            const existBrandName: ProfileInterface = await profileService.validateBrandName(value) as any; // get user in bd
            if (existBrandName && existBrandName.user_id.toString() !== user_id) {
                throw new Error('Brand name exist in our records');
            }
        }),
    check('phone_number')
        .optional()
        .isString()
        .withMessage('Brand phone must be string')
        .matches(/^\+\d{1,3}\d{1,14}$/)  // Expresión regular para validar el formato de número de teléfono
        .withMessage('Phone number must be a valid international phone number starting with +'),
    check('country')
        .optional()
        .isString()
        .withMessage('Country must be string')
        .isLength({ min: 2, max: 90 })
        .withMessage('Country must be min 2 characters and max 90 characters'),
    check('city')
        .optional()
        .isString()
        .withMessage('City must be string')
        .isLength({ min: 2, max: 90 })
        .withMessage('City must be min 2 characters and max 90 characters'),
    check('address')
        .optional()
        .isString()
        .withMessage('Address must be string')
        .isLength({ min: 5, max: 90 })
        .withMessage('Address must be min 5 characters and max 90 characters'),
    // check('website')
    //     .optional()
    //     .isString()
    //     .withMessage('Website must be string')
    //     .matches(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/)
    //     .withMessage('URL must be a valid URL'),
    check("type_slider")
        .optional()
        .custom(isEnum)
        .withMessage(`Invalid enum value in characteristics methods field, available ${Object.values(TypeSlider)}.`),
    check('user_id')
        .notEmpty()
        .withMessage('User id cannot be empty.')
        .isMongoId()
        .withMessage('User id must be mongo id.')
        .custom(async (id: string) => {
            const existUser = await userService.getUserById(id);
            if (!existUser) {
                throw new Error('User id dont´t exist in our records');
            }
        }),
    // pass validator
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
];

// validate profile id
const validateProfileId = [
    check('profile')
    .exists()
    .withMessage('Profile id does not exist')
    .notEmpty()
    .withMessage('Profile id is empty')
    .isString()
    .withMessage('Profile id must be a string')
    .isMongoId()
    .withMessage('Profile id must be a mongo id')
    .custom(async (profile: string) => {
        const existUser = await profileService.getProfileById(profile);
        if (!existUser) {
            throw new Error('Profile id dont´t exist in our records');
        }
    }),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
];

function isEnum(value: any): boolean {
    return Object.values(TypeSlider).includes(value);
}

export {
    updateProfileValidator,
    validateProfileId,
}