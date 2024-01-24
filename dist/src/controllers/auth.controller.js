"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const api_responser_1 = require("../utils/api.responser");
const auth_service_1 = require("../services/auth.service");
const express_validator_1 = require("express-validator");
class AuthController {
    constructor() {
        /**
         * Do login user
         * @param {Request} req
         * @param {Response} res
         */
        this.loginUser = async (req, res) => {
            try {
                const body = (0, express_validator_1.matchedData)(req); // get bodyd data formated correctly.
                await this.service.loginUser(res, body); // do login user
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error on login');
            }
        };
        /**
         * Do register user
         * @param {Request} req
         * @param {Response} res
         */
        this.registerUser = async (req, res) => {
            try {
                const body = (0, express_validator_1.matchedData)(req); // get bodyd data formated correctly.
                await this.service.registerUser(res, body); // do register user
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error on login');
            }
        };
        this.service = new auth_service_1.AuthService();
    }
}
exports.AuthController = AuthController;
