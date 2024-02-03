import { Response } from "express";
import { ObjectId } from "mongoose";
import { Utils } from "../utils/utils";
import ProfileModel from "../models/profile.model";
import { SubscriptionService } from "./subscriptions.service";
import { ProfileInterface } from './../interfaces/profile.interface';
import { errorResponse, notFountResponse, successResponse } from "../utils/api.responser";

export class ProfileService {
    model: any = ProfileModel;
    utils: Utils;
    subscriptionService: SubscriptionService;

    constructor(
    ) {
        this.utils = new Utils();
        this.subscriptionService = new SubscriptionService();
    }

    /**
     * update profiule
     * @param { Response } res
     * @param { ProfileInterface }  body
     */
    updateProfileData = async (res: Response, body: ProfileInterface, userId: ObjectId) => {
        try {
            let profile = await this.model.findOneAndUpdate(
                {
                    user_id: userId
                },
                body,
                {
                    new: true
                }
            );
            if (!profile) {
                profile = await this.createProfile(body);
            }
            return successResponse(res, profile, 'Profile update success');
        } catch (error) {
            return errorResponse(res, error, 'Error updating profile.');
        }
    }

    /**
     * create profile
     * @param { ProfileInterface } body
     */
    createProfile = async (body: ProfileInterface): Promise<ProfileInterface | void> => {
        let profile = await this.model.create(body);
        if (profile) {
            return profile;
        }
    }


    /**
     * Validate if isset brand name
     * @param { string } brandName
     */
    validateBrandName = async (brandName: string): Promise<boolean | ProfileInterface> => {
        const issetBrandName: ProfileInterface = await this.model.findOne({
            brand_name: brandName
        });
        if (issetBrandName) {
            return issetBrandName;
        }
        return false;
    }

    /**
     * get profile data
     * @param { Response } res
     * @param { string } id
     */
    getProfile = async (res: Response, id: string) => {
        try {
            const profile: ProfileInterface = await this.model.findOne({
                user_id: id
            });
            const subscription = await this.subscriptionService.getLastSubscription(id);
            const now = this.utils.getDate();
            return successResponse(
                res,
                {
                    profile,
                    subscription,
                    now
                },
                'Profile data');
        } catch (error) {
            return errorResponse(res, error, 'Error getting profile.');
        }
    }

    /**
     * Get profile data by id
     * @param {string} id
     */
    getProfileById = async(id: string): Promise<ProfileInterface | boolean> => {
        const profile = await this.model.findOne({
            _id: id
        });
        if (profile)
            return profile;
        return false;
    }

    /**
     * change profile pictury
     * @param { Response } res
     * @param { string } profileId
     * @param { any } file
     */
    changeProfilePictury = async (res: Response, profileId: string, file: any) => {
        try {
            // get profile
            const profile = await this.model.findOne({ _id: profileId });
            // validate if have profile pictury custom
            if (profile.profile_pictury !== 'profile.webp') {
                this.utils.deleteItemFromStorage(`profile/${profile.profile_pictury}`)
            }
            // set new profile img
            profile.profile_pictury = file.filename;
            await profile.save();
            // return data
            return successResponse(res, profile, 'Profile pictury change success');
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get profile data by id
     * @param {string} id
     */
    getProfileByUserId = async(id: string): Promise<ProfileInterface | boolean> => {
        const profile = await this.model.findOne({
            user_id: id
        });
        if (profile)
            return profile;
        return false;
    }

    /**
     * set configuration profile
     */
    setConfigurationOnProfile = async (res: Response, body: ProfileInterface, profileId: string | ObjectId) =>{
        try {
            // update configuration data
            const profile = await this.model.findOneAndUpdate(
                { _id: profileId },
                {
                    whatsapp_message: body.whatsapp_message || null,
                    brand_color: body.brand_color || null,
                    type_slider: body.type_slider || null,
                },
                {
                    new: true,
                }
            );
            // valdiate if profile exists
            if (!profile) {
                return notFountResponse(res, profileId, 'Don´t exists profile with this ID.');
            }
            // return data
            return successResponse(res, profile, 'Profile configuration set successfully');
        } catch (error) {
            throw error  
        }
    }
}