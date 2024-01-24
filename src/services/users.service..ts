import { Response } from "express";
import { Utils } from "../utils/utils";
import UserModel from "../models/users.model";
import mongoose, { ObjectId } from "mongoose";
import { ProfileService } from "./profiles.service";
import { User } from "../interfaces/users.interface";
import { ResponseInterface } from "../interfaces/response.interface";
import { successResponse, errorResponse, createdResponse, notFountResponse } from "../utils/api.responser";
import { TypeSlider } from "../interfaces/profile.interface";

export class UserService {
    user = {}
    model: any = UserModel;
    utils: Utils;
    profileService: ProfileService;

    constructor() {
        this.user = {
            username: "",
            name: "",
            email: "",
            last_name: "",
            password: "",
            role: "",
            scopes: [],
            parent: ""
        } as User;
        this.utils = new Utils();
        this.profileService = new ProfileService();
    }

    /**
     * create user data
     * @param {*} res
     * @param {User} user
     */
    createUser = async (res: Response, user: User, userId: string): Promise<User | ResponseInterface | void> => {
        try {
            // set parent, hashPassword and role data
            user.parent = userId;
            user.password = await this.utils.encryptPassword(user.password);
            // create user in bbdd
            const userBd: User = await this.model.create(user);
            // generate profile
            if (user?.role === 'admin') {
                await this.profileService.createProfile({
                    brand_name: '',
                    phone_number: '',
                    country: '',
                    city: '',
                    address: '',
                    website: '',
                    type_slider: TypeSlider.Simple,
                    user_id: userBd._id as any
                })
            }
            // reutrn response
            return createdResponse(res, userBd, "User registered correctly");
        } catch (error) {
            return errorResponse(res, error, 'Error registered user.');
        }
    }

    /**
     * List user data
     * @param {*} res
     * @param {string} userId
     */
    getUsers = async (res: Response, userId: string, page: number, perPage: number, search: string): Promise<User[] | ResponseInterface | void> => {
        try {
            // Inicializar datos de paginación
            page = page || 1;
            perPage = perPage || 12;
            const skip = (page - 1) * perPage;
          
            // Iniciar consulta
            let query:any = { parent: userId };
            if (search) {
              const searchRegex = new RegExp(search, 'i');
              query = {
                parent: userId,
                $or: [
                  { name: searchRegex },
                  { phone: searchRegex },
                  { email: searchRegex },
                  { address: searchRegex },
                ],
              };
            }
          
            let users = await this.model.find(query).skip(skip).limit(perPage);
            const data: User[] = users;
          
            // Contar el modelo por usuario
            const totalUsers = await this.model.countDocuments().merge(query);
            const totalPages = Math.ceil(totalUsers / perPage);

            // Retornar datos
            return successResponse(res, { users: data, totalPages }, 'List users');
        } catch (error) {
          return errorResponse(res, error, 'Error listing users.');
        }
    }

    /**
     * show user data
     * @param {*} res
     * @param {string} userId
     */
    getUser = async (res: Response, userId: string): Promise<User[] | ResponseInterface | void> => {
        try {
            const user: User[] = await this.model.findOne({_id: userId});
            return successResponse(res, user, "User data");
        } catch (error) {
            return errorResponse(res, error, 'Error showing user.');
        }
    }

    /**
     * update user data
     * @param {*} res
     * @param {string} userId
     * @param {User} user
     */
    updateUsers = async (res: Response, userId: string, user: User): Promise<User[] | ResponseInterface | void> => {
        try {
            const userUpdate = await this.model.findOneAndUpdate(
                {_id: userId},
                user,
                {
                    new: true,
                }
            );
            if (!userUpdate)
                return notFountResponse(res, {}, 'User don´t exist in our records')
            return successResponse(res, userUpdate, "User updated correctly");
        } catch (error) {
            return errorResponse(res, error, 'Error updating user.');
        }
    }

     /**
      * Delete user data
     * @param {*} res
     * @param {string} userId
     */
     deleteUsers = async (res: Response, userId: string): Promise<User | ResponseInterface | void> => {
        try {
            const user = await this.model.findOneAndDelete({_id: userId});
            return successResponse(res, user, "User deleted correctly");
        } catch (error) {
            return errorResponse(res, error, 'Error deleting user.');
        }
    }

    /**
     * Validate if username exist
     * @param {string} username
     */
    validateUserByName = async(username: string): Promise<User | boolean> => {
        const user = await this.model.findOne({
            username: username
        });
        if (user)
            return user;
        return false;
    }

    /**
     * Validate if email exist
     * @param {string} username
     */
    validateUserByEmail = async(email: string): Promise<boolean> => {
        const user = await this.model.findOne({
            email: email
        });
        if (user)
            return user;
        return false;
    }

    /**
     * Get user data by id
     * @param {string} id
     */
    getUserById = async(id: string): Promise<User | boolean> => {
        const user = await this.model.findOne({
            _id: id
        });
        if (user)
            return user;
        return false;
    }

    /**
     * Push catalogue to user
     * @param {mongoose.Schema.Types.ObjectId} userId
     * @param {string} catalogueId
     */
    pushCatalogue = async (userId: mongoose.Schema.Types.ObjectId, catalogueId: string): Promise<void> => {
        const user = await this.model.findOne({ _id: userId });
        if (!user.catalogues) {
            user.catalogues = [];
            await user.save();
        }
        user.catalogues.push(catalogueId);
        await user.save();
    }

    /**
     * Delete catalogs from user
     * @param {string} userId
     * @param {string} catalogueId
     */
    deleteCatalog = async (userId: ObjectId, catalogueId: string): Promise<void> => {
        await this.model.findOneAndUpdate(
            userId,
            {
                $pull: { catalogues: catalogueId }
            }
        );
    }
}
