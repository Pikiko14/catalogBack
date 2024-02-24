"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const utils_1 = require("../utils/utils");
const s3_service_1 = require("./aws/s3/s3.service");
const profile_model_1 = __importDefault(require("../models/profile.model"));
const subscriptions_service_1 = require("./subscriptions.service");
const api_responser_1 = require("../utils/api.responser");
class ProfileService {
    constructor() {
        this.model = profile_model_1.default;
        /**
         * update profiule
         * @param { Response } res
         * @param { ProfileInterface }  body
         */
        this.updateProfileData = async (res, body, userId) => {
            try {
                let profile = await this.model.findOneAndUpdate({
                    user_id: userId
                }, body, {
                    new: true
                });
                if (!profile) {
                    profile = await this.createProfile(body);
                }
                return (0, api_responser_1.successResponse)(res, profile, 'Profile update success');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error updating profile.');
            }
        };
        /**
         * create profile
         * @param { ProfileInterface } body
         */
        this.createProfile = async (body) => {
            let profile = await this.model.create(body);
            if (profile) {
                return profile;
            }
        };
        /**
         * Validate if isset brand name
         * @param { string } brandName
         */
        this.validateBrandName = async (brandName) => {
            const issetBrandName = await this.model.findOne({
                brand_name: brandName
            });
            if (issetBrandName) {
                return issetBrandName;
            }
            return false;
        };
        /**
         * get profile data
         * @param { Response } res
         * @param { string } id
         */
        this.getProfile = async (res, id) => {
            try {
                const profile = await this.model.findOne({
                    user_id: id
                });
                const subscription = await this.subscriptionService.getLastSubscription(id);
                const now = this.utils.getDate();
                return (0, api_responser_1.successResponse)(res, {
                    profile,
                    subscription,
                    now
                }, 'Profile data');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error getting profile.');
            }
        };
        /**
         * Get profile data by id
         * @param {string} id
         */
        this.getProfileById = async (id) => {
            const profile = await this.model.findOne({
                _id: id
            });
            if (profile)
                return profile;
            return false;
        };
        /**
         * change profile pictury
         * @param { Response } res
         * @param { string } profileId
         * @param { any } file
         */
        this.changeProfilePictury = async (res, profileId, file) => {
            try {
                // get profile
                const profile = await this.model.findOne({ _id: profileId });
                // validate if have profile pictury custom
                if (profile.profile_pictury !== 'profile.webp') {
                    if (profile.profile_pictury && profile.profile_pictury.includes('.s3.us-east-2')) {
                        const key = profile.profile_pictury.split('/').pop();
                        await this.s3Service.deleteSingleObject(key);
                    }
                    else {
                        this.utils.deleteItemFromStorage(`profile/${profile.profile_pictury}`);
                    }
                }
                // set new profile pictury
                if (file) {
                    const fileS3 = await this.s3Service.uploadSingleObject(file);
                    profile.profile_pictury = fileS3;
                    await profile.save();
                }
                // return data
                return (0, api_responser_1.successResponse)(res, profile, 'Profile pictury change success');
            }
            catch (error) {
                throw error;
            }
        };
        /**
         * Get profile data by id
         * @param {string} id
         */
        this.getProfileByUserId = async (id) => {
            const profile = await this.model.findOne({
                user_id: id
            });
            if (profile)
                return profile;
            return false;
        };
        /**
         * set configuration profile
         */
        this.setConfigurationOnProfile = async (res, body, profileId) => {
            try {
                // update configuration data
                const profile = await this.model.findOneAndUpdate({ _id: profileId }, {
                    whatsapp_message: body.whatsapp_message || null,
                    brand_color: body.brand_color || null,
                    type_slider: body.type_slider || null,
                }, {
                    new: true,
                });
                // valdiate if profile exists
                if (!profile) {
                    return (0, api_responser_1.notFountResponse)(res, profileId, 'Don´t exists profile with this ID.');
                }
                // return data
                return (0, api_responser_1.successResponse)(res, profile, 'Profile configuration set successfully');
            }
            catch (error) {
                throw error;
            }
        };
        this.utils = new utils_1.Utils();
        this.s3Service = new s3_service_1.S3Service();
        this.subscriptionService = new subscriptions_service_1.SubscriptionService();
    }
}
exports.ProfileService = ProfileService;
