import { Response } from "express";
import { Utils } from "../utils/utils";
import { User } from "../interfaces/users.interface";
import CategoriesModel from "../models/categories.model";
import { CategoryInterface } from "../interfaces/categories.interface";
import { errorResponse, successResponse } from "../utils/api.responser";
import { CatalogueService } from "./catalogues.service";
import { Catalogue } from "../interfaces/catalogues.interface";

export class CategoriesService {
    utils: Utils;
    model: any = CategoriesModel;
    catalogueService: CatalogueService;

    constructor () {
        this.utils = new Utils;
        this.catalogueService = new CatalogueService();
    }

    /**
     * create categories
     * @param { Response } res
     * @param { any } params
     */
    createCategories = async (res: Response, { body, user, file }:{ body: CategoryInterface, user: User, file: any }): Promise<CategoryInterface | void> => {
        try {
            body.user_id = user.parent || user._id;
            const category = await this.model.create(body);
            if (file) {
                const path = await this.utils.getPath('categories');
                category.image = `/${path}/${file.filename}`;
            }
            await category.save();
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
    updateCategories = async (res: Response, id: string, body: CategoryInterface, file: any) => {
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
            if (file) {
                if (category.image) {
                    await this.utils.deleteItemFromStorage(category.image);
                }
                // save new image
                const path = await this.utils.getPath('categories');
                category.image = `/${path}/${file.filename}`;
                await category.save();
            }
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
            if (category.image) {
                await this.utils.deleteItemFromStorage(category.image);
            }
            return successResponse(res, category, "Categories deleted success");
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error deleting categories');
        }
    }

    /**
     * @param { Response } res
     * @param { string } catalogueId
     */
    public async listCategoriesByCatalog (res: Response, catalogueId: string) {
        try {
            let categories: CategoryInterface[] = [];
            const catalogue: Catalogue = await this.catalogueService.findById(catalogueId) as Catalogue;
            if (catalogue) {
                categories = await this.model.find({ user_id: catalogue.user_id }, '_id name image');
            }
            return successResponse(res, categories, 'Categories list');
        } catch (error) {
            throw error;
        }
    }
}