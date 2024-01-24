import { Request, Response } from "express";
import { errorResponse } from "../utils/api.responser";
import { ProfileService } from "../services/profiles.service";
import { matchedData } from "express-validator";
import { ProfileInterface } from "../interfaces/profile.interface";
import { RequestExt } from "../interfaces/req-ext";

export class ProfileController {
    service: ProfileService;

    constructor() {
        this.service = new ProfileService();
    }

    /**
     * Create or uptate profile
     * @param { Request } req
     * @param { Response } res
     */
    createOrUpdateProfile = async (req: RequestExt, res: Response) => {
        try {
            const body: ProfileInterface = matchedData(req) as ProfileInterface;
            const { user_id } = body;
            await this.service.updateProfileData(res, body, user_id);
        } catch (error) {
            return errorResponse(res, error, 'Error updating profile.');
        }
    }

    /**
     * List profile data
     * @param { Request } req
     * @param { Response } res
     */
    getProfile = async (req: RequestExt, res: Response) => {
        try {
            const { id } = req.params;
            await this.service.getProfile(res, id);
        } catch (error) {
            return errorResponse(res, error, 'Error getting profile.');
        }
    }

    /**
     * Change profile pictury
     * @param { Request } req
     * @param { Response } req
     */
    changeProfilePictury = async (req: RequestExt, res: Response) => {
        try {
            const { profile } = matchedData(req);
            const { file } = req;
            await this.service.changeProfilePictury(res, profile, file);
        } catch (error) {
            return errorResponse(res, error, 'Error change profile pictury.');
        }
    }
}