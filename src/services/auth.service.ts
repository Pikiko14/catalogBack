import { Response } from "express";
import { Utils } from "../utils/utils";
import { UserService } from "./users.service"
import { User } from "../interfaces/users.interface";
import { LoginInterface, LoginReturn } from "../interfaces/auth.interface";
import { errorResponse, unProcesableEntityResponse, successResponse } from "../utils/api.responser";
import { Model } from "mongoose";

export class AuthService {
    userService: UserService;
    role: string;
    scopes: string[];
    utils: Utils;

    constructor() {
        this.userService = new UserService();
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
        this.utils = new Utils();
    }

    /**
     * do login user
     * @param {LoginInterface} loginData
     */
    loginUser = async (res: Response, {username, password}: LoginInterface) => {
        try {
            const user = await this.userService.validateUserByName(username) as User | any; // get user bd data
            // validamos la contraseña
            const isValidPassowrd = await this.utils.comparePassword(user.password, password);
            if (!isValidPassowrd)
                return errorResponse(res, {}, 'Invalid password')
            // generamos el token
            const token = await this.utils.generateToken(user);
            // set data
            user.set('password', undefined, { strict: false });
            const data: LoginReturn = {
                token,
                user
            }
            // return data
            return successResponse(res, data, 'Login success.');
        } catch (error) {
            return errorResponse(res, error, 'Error login');
        }
    }

    /**
     * do login user
     * @param {LoginInterface} loginData
     */
    registerUser = async (res: Response, user: User): Promise<Response | any> => {
        try {
            // add other some user data
            user.role = user.role ? user.role : this.role;
            user.scopes = this.scopes;
            // do register user
            await this.userService.createUser(res, user, '');
        } catch (error) {
            return errorResponse(res, error, 'Error registering user.');
        }
    }
}