import { Response } from "express";
import { User } from "../interfaces/users.interface";
import CategoriesModel from "../models/categories.model";
import { CategoryInterface } from "../interfaces/categories.interface";
import { errorResponse, successResponse } from "../utils/api.responser";

export class CategoriesService {
    model: any = CategoriesModel;

    constructor () {
    }

    /**
     * create categories
     * @param { Response } res
     * @param { any } params
     */
    createCategories = async (res: Response, { body, user }:{body: CategoryInterface, user: User}): Promise<CategoryInterface | void> => {
        try {
            body.user_id = user.parent || user._id;
            const category: CategoryInterface = await this.model.create(body);
            return successResponse(res, category, 'Category created success');
        } catch (error: any) {
            return errorResponse(res, error, 'Error create categories');
        }
    }

    /**
     * 
     * @param { Response } res
     * @param { string } userId
     * @param page
     * @param perPage
     * @returns
     */
    listCategories = async (res: Response, userId: string, {page, perPage, search}:{page: any, perPage: any, search: any}): Promise<CategoryInterface[] | void> => {
        try {
             // init pagination data
            page = page || 1;
            perPage = perPage || 12;
            const skip = (page - 1) * perPage;
             // Iniciar consulta
             let query: any = { user_id: userId };
             if (search) {
                const searchRegex = new RegExp(search, 'i');
                query = {
                    user_id: userId,
                    $or: [
                        { name: searchRegex },
                    ],
                };
            }
            // do query
            const categories: CategoryInterface[] = await this.model.find(query).skip(skip).limit(perPage);
            // Count model by user
            const totalCategories = await this.model.countDocuments().merge(query);
            const totalPages = Math.ceil(totalCategories / perPage);
            // return data 
            return successResponse(res, { categories, totalPages, totalCategories }, 'List Categories');
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error listing categories');
        }
    }

    /**
     * find category by id
     * @param { string } id
     */
    findById = async (id: string): Promise<CategoryInterface | void> => {
        const category = await this.model.findById(id);
        if (category) {
            return category;
        }
    }

    /**
     * update category
     * @param { Response } res
     * @param { string } id
     * @param { CategoryInterface } body
     * @returns 
     */
    updateCategories = async (res: Response, id: string, body: CategoryInterface) => {
        try {
            const category = await this.model.findOneAndUpdate(
                {
                    _id: id
                },
                body,
                {
                    new: true
                }
            );
            return successResponse(res, category, 'Category updated success');
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error updating categories');
        }
    }

    /**
     * delete category
     * @param { Response } res
     * @param { string } id
     */
    deleteCategories = async (res: Response, id: string) => {
        try {
            const category = await this.model.findOneAndDelete({
                _id: id
            });
            return successResponse(res, category, "Categories deleted success");
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error deleting categories');
        }
    }
}