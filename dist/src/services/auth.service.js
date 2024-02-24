"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const utils_1 = require("../utils/utils");
const users_service_1 = require("./users.service");
const api_responser_1 = require("../utils/api.responser");
class AuthService {
    constructor() {
        /**
         * do login user
         * @param {LoginInterface} loginData
         */
        this.loginUser = async (res, { username, password }) => {
            try {
                const user = await this.userService.validateUserByName(username); // get user bd data
                // validamos la contraseña
                const isValidPassowrd = await this.utils.comparePassword(user.password, password);
                if (!isValidPassowrd)
                    return (0, api_responser_1.errorResponse)(res, {}, 'Invalid password');
                // generamos el token
                const token = await this.utils.generateToken(user);
                // set data
                user.set('password', undefined, { strict: false });
                const data = {
                    token,
                    user
                };
                // return data
                return (0, api_responser_1.successResponse)(res, data, 'Login success.');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error login');
            }
        };
        /**
         * do login user
         * @param {LoginInterface} loginData
         */
        this.registerUser = async (res, user) => {
            try {
                // add other some user data
                user.role = user.role ? user.role : this.role;
                user.scopes = this.scopes;
                // do register user
                await this.userService.createUser(res, user, '');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error registering user.');
            }
        };
        this.userService = new users_service_1.UserService();
        this.role = 'admin';
        // this.role = 'super_admin';
        this.scopes = [
            'create-user',
            'delete-user',
            'list-user',
            'show-user',
            'update-user',
            'create-catalogues',
            'delete-catalogues',
            'list-catalogues',
            'show-catalogues',
            'update-catalogues',
            'create-pages',
            'delete-pages',
            'list-pages',
            'show-pages',
            'update-pages',
            'activate-catalog',
            // estos son scopes admin
            // 'create-plan',
            // 'update-plan',
            // 'delete-plan',
            'list-plan',
            'update-profile',
            'list-profile',
            'change-profile-pictury',
            'create-categories',
            'list-categories',
            'update-categories',
            'delete-categories',
            'create-products',
            'list-products',
            'update-products',
            'delete-products',
        ];
        this.utils = new utils_1.Utils();
    }
}
exports.AuthService = AuthService;
