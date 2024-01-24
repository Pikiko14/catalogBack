"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserData = exports.UserIdValidator = void 0;
const express_validator_1 = require("express-validator");
const users_service_1 = require("../services/users.service.");
const handler_validator_1 = require("../utils/handler.validator");
// instanciate all class neccesaries
const userService = new users_service_1.UserService();
// handler validators
// id validator
const UserIdValidator = [
    (0, express_validator_1.check)('id')
        .exists()
        .withMessage('User id does not exist')
        .notEmpty()
        .withMessage('user id is empty')
        .isString()
        .withMessage('User id must be a string')
        .isMongoId()
        .withMessage('User id must be a mongo id')
        .custom(async (id) => {
        const existUser = await userService.getUserById(id);
        if (!existUser) {
            throw new Error('User id dont´t exist in our records');
        }
    }),
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
];
exports.UserIdValidator = UserIdValidator;
// update user data
const UpdateUserData = [
    (0, express_validator_1.check)('username')
        .exists()
        .withMessage('Username does not exist')
        .notEmpty()
        .withMessage('Username is empty')
        .isString()
        .withMessage('Username must be a string')
        .isLength({ min: 5, max: 90 })
        .withMessage('Username must have a minimum of 5 characters')
        .custom(async (username, { req }) => {
        const { id } = req.params; // get param user to edit
        const existUser = await userService.validateUserByName(username); // get user in bd
        if (existUser && existUser.id !== id) {
            throw new Error('Username exist in our records');
        }
    }),
    (0, express_validator_1.check)('password')
        .if((value, { req }) => req.body.password.length > 0)
        .exists()
        .withMessage('Password is empty')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/\d/)
        .withMessage('Password must contain at least one number')
        .matches(/[$@#&!-]/)
        .withMessage('Password must contain at least one special character like $, @, #, &, - or !'),
    (0, express_validator_1.check)('name')
        .exists()
        .withMessage('First name dost not exist')
        .isString()
        .withMessage('First name must be a string')
        .notEmpty()
        .withMessage('First name is empty')
        .isLength({ min: 4, max: 90 })
        .withMessage('First name must have a minimum of 5 characters'),
    (0, express_validator_1.check)('last_name')
        .exists()
        .withMessage('Last name dost not exist')
        .notEmpty()
        .withMessage('Last name is empty')
        .isString()
        .withMessage('Last name must be a string')
        .isLength({ min: 4, max: 90 })
        .withMessage('Last name must have a minimum of 5 characters'),
    (0, express_validator_1.check)('email')
        .exists()
        .withMessage('Email does not exist')
        .notEmpty()
        .withMessage('Email is empty')
        .isString()
        .withMessage('Email must be a string')
        .isEmail()
        .withMessage('Invalid email format')
        .isLength({ min: 5, max: 90 })
        .withMessage('Email must have a minimum of 5 characters')
        .custom(async (email, { req }) => {
        const { id } = req.params; // get param user to edit
        const existEmail = await userService.validateUserByEmail(email); // get user in bd by email
        if (existEmail && existEmail.id !== id) {
            throw new Error('Email exist in our records');
        }
    }),
    (req, res, next) => (0, handler_validator_1.handlerValidator)(req, res, next),
];
exports.UpdateUserData = UpdateUserData;
