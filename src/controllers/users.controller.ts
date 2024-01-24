import { Response, Request } from "express";
import { errorResponse } from "../utils/api.responser";
import { User } from "../interfaces/users.interface";
import { UserService } from "../services/users.service."
import { matchedData } from "express-validator";

// instances of clases

export class UsersController {
    users = <User[]>[];
    service: UserService | any = null;    
    scopes: string[];
    role: string = '';

    /**
     * Constructor
     */
    constructor() {
        this.users = [];
        this.service = new UserService();
        this.role = 'employe';
        this.scopes = [
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
            'list-profile',
            'create-categories',
            'list-categories',
            'update-categories',
            'delete-categories',
            'create-products',
            'list-products',
            'update-products',
        ];
    }

    /**
     * Listo todos los usuarios registrados en el sistema
     * @param req
     * @param res 
     */
    getUsers = async (req: Request | any, res: Response) => {
        try {
            const { _id } = req.user; // get login user id
            const { page, perPage, search } = req.query;
            await this.service.getUsers(res, _id, page, perPage, search); // get list of users data
        } catch (error) {
            return errorResponse(res, error, 'Error listando los usuarios');
        }
    }

    /**
     * filtro un usuario especifico
     * @param req
     * @param res 
     */
    getUser = async (req: Request, res: Response) => {
        try {
            await this.service.getUser(res, req.params.id);
        } catch (error) {
            return errorResponse(res, error, 'Error filtrando los usuarios');
        }
    }

    /**
     * modifico un usuario especifico
     * @param req
     * @param res 
     */
    updateUsers = async ({params, body}: Request, res: Response) => {
        try {
            await this.service.updateUsers(res, params.id, body);
        } catch (error) {
            return errorResponse(res, error, 'Error modificando el usuario');
        }
    }

    /**
     * elimino un usuario de la base de datos.
     * @param req
     * @param res 
     */
    deleteUsers = async ({params}: Request, res: Response) => {
        try {
            await this.service.deleteUsers(res, params.id);
        } catch (error) {
            return errorResponse(res, error, 'Error eliminando el usuario');
        }
    }

    /**
     * Creo un usuario nuevo
     * @param req
     * @param res 
     */
    storeUsers = async (req: Request | any, res: Response) => {
        try {
            const body: User = matchedData(req) as User;
            body.role = this.role;
            body.scopes = this.scopes;
            body.name = req.body.name ? req.body.name : '';
            body.last_name = req.body.last_name ? req.body.last_name : '';
            await this.service.createUser(res, body, req.user._id);
        } catch (error) {
            console.log(error);
            return errorResponse(res, error, 'Error creando el usuario');
        }
    }
}