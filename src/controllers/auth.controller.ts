import { Response, Request } from "express";
import { errorResponse } from "../utils/api.responser";
import { AuthService } from "../services/auth.service";
import { matchedData  } from "express-validator"; 
import { LoginInterface } from "../interfaces/auth.interface";
import { User } from "../interfaces/users.interface";

export class AuthController {
    service: AuthService;
    constructor() {
        this.service = new AuthService();
    }

    /**
     * Do login user
     * @param {Request} req
     * @param {Response} res
     */
    loginUser = async (req: Request, res: Response) => {
        try {
            const body: LoginInterface = matchedData(req) as LoginInterface; // get bodyd data formated correctly.
            await this.service.loginUser(res, body); // do login user
        } catch (error) {
            return errorResponse(res, error, 'Error on login');
        }
    }

    /**
     * Do register user
     * @param {Request} req
     * @param {Response} res
     */
    registerUser = async (req: Request, res: Response) => {
        try {
            const body: User = matchedData(req) as User; // get bodyd data formated correctly.
            await this.service.registerUser(res, body); // do register user
        } catch (error) {
            return errorResponse(res, error, 'Error on login');
        }
    }

    /**
     * Do register user
     * @param {Request} req
     * @param {Response} res
     */
    recoveryPassword = async (req: Request, res: Response) => {
        try {
            const body = matchedData(req); // get bodyd data formated correctly.
            await this.service.recoveryPassword(res, body); // do register user
        } catch (error) {
            return errorResponse(res, error, 'Error on login');
        }
    }
}