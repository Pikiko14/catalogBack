import { check } from 'express-validator';
import { UserService } from '../services/users.service.';
import { Request, Response, NextFunction } from 'express';
import { handlerValidator } from '../utils/handler.validator';
import { User } from '../interfaces/users.interface';

// instanciate all class neccesaries
const userService = new UserService();

// handler validators

// id validator
const UserIdValidator = [
    check('id')
    .exists()
    .withMessage('User id does not exist')
    .notEmpty()
    .withMessage('user id is empty')
    .isString()
    .withMessage('User id must be a string')
    .isMongoId()
    .withMessage('User id must be a mongo id')
    .custom(async (id: string) => {
        const existUser = await userService.getUserById(id);
        if (!existUser) {
            throw new Error('User id dont´t exist in our records');
        }
        return true;
    }),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
];

// update user data
const UpdateUserData = [
    check('username')
    .exists()
    .withMessage('Username does not exist')
    .notEmpty()
    .withMessage('Username is empty')
    .isString()
    .withMessage('Username must be a string')
    .isLength({ min: 5, max: 90 })
    .withMessage('Username must have a minimum of 5 characters')
    .custom(async (username: string, { req }) => {
        const { id } = req.params as any; // get param user to edit
        const existUser: any | User = await userService.validateUserByName(username) as User; // get user in bd
        if (existUser && existUser.id !== id) {
            throw new Error('Username exist in our records');
        }
        return true;
    }),
    check('password')
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
    check('name')
        .exists()
        .withMessage('First name dost not exist')
        .isString()
        .withMessage('First name must be a string')
        .notEmpty()
        .withMessage('First name is empty')
        .isLength({ min: 4, max: 90 })
        .withMessage('First name must have a minimum of 5 characters'),
    check('last_name')
        .exists()
        .withMessage('Last name dost not exist')
        .notEmpty()
        .withMessage('Last name is empty')
        .isString()
        .withMessage('Last name must be a string')
        .isLength({ min: 4, max: 90 })
        .withMessage('Last name must have a minimum of 5 characters'),
    check('email')
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
    .custom(async (email: string, { req }) => {
        const { id } = req.params as any; // get param user to edit
        const existEmail: any = await userService.validateUserByEmail(email); // get user in bd by email
        if (existEmail && existEmail.id !== id) {
            throw new Error('Email exist in our records');
        }
    }),
    (req: Request, res: Response, next: NextFunction) => handlerValidator(req, res, next),
]

export {
    UserIdValidator,
    UpdateUserData
}