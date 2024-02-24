"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const utils_1 = require("../utils/utils");
const users_model_1 = __importDefault(require("../models/users.model"));
const profiles_service_1 = require("./profiles.service");
const api_responser_1 = require("../utils/api.responser");
const profile_interface_1 = require("../interfaces/profile.interface");
class UserService {
    constructor() {
        this.user = {};
        this.model = users_model_1.default;
        /**
         * create user data
         * @param {*} res
         * @param {User} user
         */
        this.createUser = async (res, user, userId) => {
            try {
                // set parent, hashPassword and role data
                user.parent = userId;
                user.password = await this.utils.encryptPassword(user.password);
                // create user in bbdd
                const userBd = await this.model.create(user);
                // generate profile
                if ((user === null || user === void 0 ? void 0 : user.role) === 'admin') {
                    await this.profileService.createProfile({
                        brand_name: '',
                        phone_number: '',
                        country: '',
                        city: '',
                        address: '',
                        website: '',
                        type_slider: profile_interface_1.TypeSlider.Simple,
                        user_id: userBd._id
                    });
                }
                // reutrn response
                return (0, api_responser_1.createdResponse)(res, userBd, "User registered correctly");
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error registered user.');
            }
        };
        /**
         * List user data
         * @param {*} res
         * @param {string} userId
         */
        this.getUsers = async (res, userId, page, perPage, search) => {
            try {
                // Inicializar datos de paginación
                page = page || 1;
                perPage = perPage || 12;
                const skip = (page - 1) * perPage;
                // Iniciar consulta
                let query = { parent: userId };
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
                const data = users;
                // Contar el modelo por usuario
                const totalUsers = await this.model.countDocuments().merge(query);
                const totalPages = Math.ceil(totalUsers / perPage);
                // Retornar datos
                return (0, api_responser_1.successResponse)(res, { users: data, totalPages, totalUsers }, 'List users');
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error listing users.');
            }
        };
        /**
         * show user data
         * @param {*} res
         * @param {string} userId
         */
        this.getUser = async (res, userId) => {
            try {
                const user = await this.model.findOne({ _id: userId });
                return (0, api_responser_1.successResponse)(res, user, "User data");
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error showing user.');
            }
        };
        /**
         * update user data
         * @param {*} res
         * @param {string} userId
         * @param {User} user
         */
        this.updateUsers = async (res, userId, user) => {
            try {
                // encrypt password
                if (user.password) {
                    user.password = await this.utils.encryptPassword(user.password);
                }
                // update data
                const userUpdate = await this.model.findOneAndUpdate({ _id: userId }, user, {
                    new: true,
                });
                // return response si user dont found
                if (!userUpdate)
                    return (0, api_responser_1.notFountResponse)(res, {}, 'User don´t exist in our records');
                // return data
                return (0, api_responser_1.successResponse)(res, userUpdate, "User updated correctly");
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error updating user.');
            }
        };
        /**
         * Delete user data
        * @param {*} res
        * @param {string} userId
        */
        this.deleteUsers = async (res, userId) => {
            try {
                const user = await this.model.findOneAndDelete({ _id: userId });
                return (0, api_responser_1.successResponse)(res, user, "User deleted correctly");
            }
            catch (error) {
                return (0, api_responser_1.errorResponse)(res, error, 'Error deleting user.');
            }
        };
        /**
         * Validate if username exist
         * @param {string} username
         */
        this.validateUserByName = async (username) => {
            const user = await this.model.findOne({
                username: username
            });
            if (user)
                return user;
            return false;
        };
        /**
         * Validate if email exist
         * @param {string} username
         */
        this.validateUserByEmail = async (email) => {
            const user = await this.model.findOne({
                email: email
            });
            if (user)
                return user;
            return false;
        };
        /**
         * Get user data by id
         * @param {string} id
         */
        this.getUserById = async (id) => {
            const user = await this.model.findOne({
                _id: id
            });
            if (user)
                return user;
            return false;
        };
        /**
         * Push catalogue to user
         * @param {mongoose.Schema.Types.ObjectId} userId
         * @param {string} catalogueId
         */
        this.pushCatalogue = async (userId, catalogueId) => {
            const user = await this.model.findOne({ _id: userId });
            if (!user.catalogues) {
                user.catalogues = [];
                await user.save();
            }
            user.catalogues.push(catalogueId);
            await user.save();
        };
        /**
         * Delete catalogs from user
         * @param {string} userId
         * @param {string} catalogueId
         */
        this.deleteCatalog = async (userId, catalogueId) => {
            await this.model.findOneAndUpdate(userId, {
                $pull: { catalogues: catalogueId }
            });
        };
        this.user = {
            username: "",
            name: "",
            email: "",
            last_name: "",
            password: "",
            role: "",
            scopes: [],
            parent: ""
        };
        this.utils = new utils_1.Utils();
        this.profileService = new profiles_service_1.ProfileService();
    }
}
exports.UserService = UserService;
