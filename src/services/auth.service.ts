import { Response } from "express";
import { Utils } from "../utils/utils";
import { UserService } from "./users.service";
import { QueueService } from "./queue.service";
import { User } from "../interfaces/users.interface";
import { errorResponse, notFountResponse, successResponse } from "../utils/api.responser";
import { LoginInterface, LoginReturn } from "../interfaces/auth.interface";

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

    /**
     * init and send email for change password
     * @param { Response } res
     * @param { any } body
     */
    recoveryPassword = async (res: Response, body: any): Promise<Response | any> => {
        try {
            const { email } = body; // get email from body
            const queueService = new QueueService(); //instanciate queueService
            // get user data
            const user: any  = await this.userService.validateUserByEmail(email);
            if (!user) {
                return notFountResponse(res, email, `Don´t exists user with this email ${email}`);
            }
            // prepare token for recovery
            const token = await this.utils.generateTokenForRecoveryPassword({ email });
            // set token in user
            user.recovery_token = token;
            user.save();
            // send email to user
            queueService.myFirstQueue.add({
                type: 'auth',
                token,
                action: 'send-email-recovery',
                email,
            });
            // return data
            return successResponse(res, { body }, 'Recovery email process initiated correctly. An email has been sent with instructions.');
        } catch (error: any) {
            throw error.message;  
        }
    }

    /**
     * do login user
     * @param { Response } res
     * @param { any } body
     */
    changePassword = async (res: Response, body: any): Promise<Response | any> => {
        try {
            // get new hash password
            const password: string | void = await this.utils.encryptPassword(body.password);
            // get user data
            const user: any = await this.userService.getUserByToken(body.token);
            user.recovery_token = null
            user.password = password;
            user.save();
            // return data
            return successResponse(res, { user }, 'Password changed successfully.');
        } catch (error: any) {
            throw error.message;  
        }
    }
}