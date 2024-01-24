"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const api_responser_1 = require("../utils/api.responser");
const users_service_1 = require("../services/users.service.");
const express_validator_1 = require("express-validator");
// instances of clases
class UsersController {
    /**
     * Constructor
     */
    constructor() {
        this.users = [];
        this.service = null;
        this.role = '';
        /**
         * Listo todos los usuarios registrados en el sistema
         * @param req
         * @param res
         */
        this.getUsers = async (req, res) => {
            try {
                const { _id } = req.user; // get login user id
                const { page, perPage, search } = req.query;
                await this.service.getUsers(res, _id, page, perPage, search); // get list of users data
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error listando los usuarios');
            }
        };
        /**
         * filtro un usuario especifico
         * @param req
         * @param res
         */
        this.getUser = async (req, res) => {
            try {
                await this.service.getUser(res, req.params.id);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error filtrando los usuarios');
            }
        };
        /**
         * modifico un usuario especifico
         * @param req
         * @param res
         */
        this.updateUsers = async ({ params, body }, res) => {
            try {
                await this.service.updateUsers(res, params.id, body);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error modificando el usuario');
            }
        };
        /**
         * elimino un usuario de la base de datos.
         * @param req
         * @param res
         */
        this.deleteUsers = async ({ params }, res) => {
            try {
                await this.service.deleteUsers(res, params.id);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error eliminando el usuario');
            }
        };
        /**
         * Creo un usuario nuevo
         * @param req
         * @param res
         */
        this.storeUsers = async (req, res) => {
            try {
                const body = (0, express_validator_1.matchedData)(req);
                body.role = this.role;
                body.scopes = this.scopes;
                body.name = req.body.name ? req.body.name : '';
                body.last_name = req.body.last_name ? req.body.last_name : '';
                await this.service.createUser(res, body, req.user._id);
            }
            catch (error) {
                console.log(error);
                return (0, api_responser_1.errorResponse)(res, error, 'Error creando el usuario');
            }
        };
        this.users = [];
        this.service = new users_service_1.UserService();
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
}
exports.UsersController = UsersController;
