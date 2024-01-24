"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProfileId = exports.updateProfileValidator = void 0;
const express_validator_1 = require("express-validator");
const handler_validator_1 = require("../utils/handler.validator");
const profiles_service_1 = require("../services/profiles.service");
const profile_interface_1 = require("../interfaces/profile.interface");
const users_service_1 = require("../services/users.service.");
// service
const userService = new users_service_1.UserService();
const profileService = new profiles_service_1.ProfileService();
// validate profile data
const updateProfileValidator = [
    (0, express_validator_1.check)('brand_name')
        .optional()
        .isString()
        .withMessage('Brand name must be string')
        .isLength({ min: 2, max: 60 })
        .withMessage('Brand name must be min 2 characters and max 60 characters')
        .custom(async (value, { req }) => {
        const { user_id } = req.body; // get param user to edit
        const existBrandName = await profileService.validateBrandName(value); // get user in bd
        if (existBrandName && existBrandName.user_id.toString() !== user_id) {
            throw new Error('Brand name exist in our records');
        }
    }),
    (0, express_validator_1.check)('phone_number')
        .optional()
        .isString()
        .withMessage('Brand phone must be string')
        .matches(/^\+\d{1,3}\d{1,14}$/) // Expresión regular para validar el formato de número de teléfono
        .withMessage('Phone number must be a valid international phone number starting with +'),
    (0, express_validator_1.check)('country')
        .optional()
        .isString()
        .withMessage('Country must be string')
        .isLength({ min: 2, max: 90 })
        .withMessage('Country must be min 2 characters and max 90 characters'),
    (0, express_validator_1.check)('city')
        .optional()
        .isString()
        .withMessage('City must be string')
        .isLength({ min: 2, max: 90 })
        .withMessage('City must be min 2 characters and max 90 characters'),
    (0, express_validator_1.check)('address')
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
    (0, express_validator_1.check)("type_slider")
        .optional()
        .custom(isEnum)
        .withMessage(`Invalid enum value in characteristics methods field, available ${Object.values(profile_interface_1.TypeSlider)}.`),
    (0, express_validator_1.check)('user_id')
        .notEmpty()
        .withMessage('User id cannot be empty.')
        .isMongoId()
        .withMessage('User id must be mongo id.')
        .custom(async (id) => {
        const existUser = await userService.getUserById(id);
        if (!existUser) {
            throw new Error('User id dont´t exist in our records');
        }
    }),
    // pass validator
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
];
exports.updateProfileValidator = updateProfileValidator;
// validate profile id
const validateProfileId = [
    (0, express_validator_1.check)('profile')
        .exists()
        .withMessage('Profile id does not exist')
        .notEmpty()
        .withMessage('Profile id is empty')
        .isString()
        .withMessage('Profile id must be a string')
        .isMongoId()
        .withMessage('Profile id must be a mongo id')
        .custom(async (profile) => {
        const existUser = await profileService.getProfileById(profile);
        if (!existUser) {
            throw new Error('Profile id dont´t exist in our records');
        }
    }),
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
];
exports.validateProfileId = validateProfileId;
function isEnum(value) {
    return Object.values(profile_interface_1.TypeSlider).includes(value);
}