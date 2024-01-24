"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const api_responser_1 = require("../utils/api.responser");
const profiles_service_1 = require("../services/profiles.service");
const express_validator_1 = require("express-validator");
class ProfileController {
    constructor() {
        /**
         * Create or uptate profile
         * @param { Request } req
         * @param { Response } res
         */
        this.createOrUpdateProfile = async (req, res) => {
            try {
                const body = (0, express_validator_1.matchedData)(req);
                const { user_id } = body;
                await this.service.updateProfileData(res, body, user_id);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error updating profile.');
            }
        };
        /**
         * List profile data
         * @param { Request } req
         * @param { Response } res
         */
        this.getProfile = async (req, res) => {
            try {
                const { id } = req.params;
                await this.service.getProfile(res, id);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error getting profile.');
            }
        };
        /**
         * Change profile pictury
         * @param { Request } req
         * @param { Response } req
         */
        this.changeProfilePictury = async (req, res) => {
            try {
                const { profile } = (0, express_validator_1.matchedData)(req);
                const { file } = req;
                await this.service.changeProfilePictury(res, profile, file);
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error change profile pictury.');
            }
        };
        this.service = new profiles_service_1.ProfileService();
    }
}
exports.ProfileController = ProfileController;
