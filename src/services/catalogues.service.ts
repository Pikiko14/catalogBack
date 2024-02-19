import { Response } from "express";
import { Utils } from "../utils/utils";
import { QueueService } from "./queue.service";
import { UserService } from "./users.service";
import { ProfileService } from "./profiles.service";
import mongoose, { ObjectId, mongo } from "mongoose";
import CatalogueModel from "../models/catalogues.model";
import { S3Service } from "../services/aws/s3/s3.service";
import { Catalogue } from "../interfaces/catalogues.interface";
import { ResponseInterface } from "../interfaces/response.interface";
import { successResponse, errorResponse, createdResponse } from "../utils/api.responser";

export class CatalogueService extends QueueService {
    utils: Utils;
    s3Service: S3Service;
    userService: UserService;
    model: any = CatalogueModel;
    profileService: ProfileService;

    constructor() {
        super();
        this.utils = new Utils();
        this.s3Service = new S3Service();
        this.userService = new UserService();
        this.profileService = new ProfileService();
    }

    /**
     * List catalogues by user
     * @param {*} res
     * @param {string} userId
     * @param {number} page
     * @param {number} perPage
     * @param {string} search
     */
    listCatalogues = async (
        res: Response,
        userId: string,
        page: number,
        perPage: number,
        search: string,
    ): Promise<Catalogue | ResponseInterface | void> => {
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
            const catalogues: Catalogue[] = await this.model.find(query).skip(skip).limit(perPage);
            // Count model by user
            const totalCatalogs = await this.model.countDocuments().merge(query);
            const totalPages = Math.ceil(totalCatalogs / perPage);
            // return data 
            return successResponse(res, {catalogues, totalPages, totalCatalogs }, "List catalogues."); // return data
        } catch (error) {
            return errorResponse(res, error, 'Error listing catalogues.');
        }
    }

    /**
     * Create news catalogues
     * @param { * } res
     * @param { Catalogue } body
     * @param { any } file
     */
    createCatalogue = async (
        res: Response,
        body: Catalogue,
        file: any
    ): Promise<Catalogue | ResponseInterface | void> => {
        try {
            // set dates
            const fileS3 = await this.s3Service.uploadSingleObject(file); // upload file to aws s3
            body.cover = `${fileS3}`;
            body.start_date = new Date(body.start_date);
            body.end_date = new Date(body.end_date);
            // create catalogue in bbdd
            const catalogue: Catalogue = await this.model.create(body);
            // set catalogue in user
            await this.userService.pushCatalogue(catalogue.user_id, catalogue._id);
            // reutrn response
            return createdResponse(res, catalogue, "Catalogue registered correctly");
        } catch (error) {
            return errorResponse(res, error, 'Error creating catalogues');
        }
    }

    /**
     * Create news catalogues
     * @param {*} res
     * @param {ObjectId | string} catalogueId
     */
    showCatalogue = async (
        res: Response,
        catalogueId: string | ObjectId
    ): Promise<Catalogue | ResponseInterface | void> => {
        try {
            // filter catalogue
            const catalogue: Catalogue = await this.model.findOne({ _id: catalogueId });
            // reutrn response
            return createdResponse(res, catalogue, "Catalogue information");
        } catch (error) {
            return errorResponse(res, error, 'Error show catalogues');
        }
    }

    /**
     * get catalogue by id
     * @param {*} catalogueId
     */
    findById = async (catalogueId: string): Promise<Catalogue | boolean> => {
        // find catalogue
        const catalogue = await this.model.findOne({ _id: catalogueId });
        if (catalogue)
            return catalogue;
        // main return
        return false
    }

    /**
     * Create news catalogues
     * @param {*} res
     * @param {ObjectId | string} catalogueId
     */
    deleteCatalogue = async (
        res: Response,
        catalogueId: string | ObjectId
    ): Promise<Catalogue | ResponseInterface | void> => {
        try {
            // set catalogue in user
            const catalogue: Catalogue = await this.model.findOneAndDelete({ _id: catalogueId });
            // reutrn response
            return successResponse(res, catalogue, "Catalogue deleted success");
        } catch (error) {
            return errorResponse(res, error, 'Error show catalogues');
        }
    }

    /**
     * Create news catalogues
     * @param {*} res
     * @param {Catalogue} body
     * @param { any } file
     */
    updateCatalogue = async (
        res: Response,
        body: Catalogue,
        file: any,
    ): Promise<Catalogue | ResponseInterface | void> => {
        try {
            // set dates
            body.start_date = new Date(body.start_date);
            body.end_date = new Date(body.end_date);
            // validate cover and delete old
            const catalog = await this.model.findOne({ _id: body.id });
            if (catalog.cover) {
                console.log(123);
                if (catalog.cover && catalog.cover.includes('.s3.us-east-2')) {
                    const key: string = catalog.cover.split('/').pop();
                    await this.s3Service.deleteSingleObject(key);
                    // delete from local storage
                } else {
                    await this.utils.deleteItemFromStorage(catalog.cover); // delete cover from catalog
                }
                const fileS3 = await this.s3Service.uploadSingleObject(file); // upload file to aws s3
                body.cover = `${fileS3}`;
            }
            // create catalogue in bbdd
            const catalogue: Catalogue = await this.model.findOneAndUpdate(
                {
                    _id: body.id
                },
                body,
                {
                    new: true
                },
            );
            // reutrn response
            return createdResponse(res, catalogue, "Catalogue update correctly");
        } catch (error) {
            return errorResponse(res, error, 'Error updating catalogues');
        }
    }

    /**
     * Push page to catalogue
     * @param {res} res
     * @param {mongoose.Schema.Types.ObjectId} catalogueId
     * @param {string | mongoose.Schema.Types.ObjectId} pageId
     */
    pushPage = async (
        res: Response,
        catalogueId: mongoose.Schema.Types.ObjectId,
        pageId: mongoose.Schema.Types.ObjectId | string | undefined
    ): Promise<void> => {
        try {
            await this.model.findOneAndUpdate(
                { _id: catalogueId },
                { $push: { pages: pageId } }
            );
        } catch (error) {
            return errorResponse(res, error, 'Error updating catalogues');
        }
    }

    /**
     * Count page on cataloguwe
     * @param {mongoose.Schema.Types.ObjectId} catalogueId
     */
    countPagesOnCatalogue = async (catalogueId: mongoose.Schema.Types.ObjectId): Promise<number> => {
        const catalogue = await this.model.findById(catalogueId);
        return catalogue ? catalogue.pages.length : 0;
    }

    /**
     * Delete page from catalogue pages array
     * @param {mongoose.Schema.Types.ObjectId} catalogueId
     * @param {mongoose.Schema.Types.ObjectId} page
     */
    deleteCatalog = async (catalogueId: mongoose.Schema.Types.ObjectId, page: mongoose.Schema.Types.ObjectId) => {
        await this.model.findOneAndUpdate(
            catalogueId,
            {
                $pull: { pages: page }
            }
        );
    }

    /**
     * do activation on catalog
     * @param {Response} res
     * @param {string} catalogId
     */
    doActivateCatalog = async (res: Response, id: string) => {
        try {
            const catalog = await this.model.findById(id);
            if (catalog.is_active) {
                catalog.is_active = false;
            } else {
                catalog.is_active = true;
            }
            await catalog.save();
            return successResponse(res, catalog, "Catalogo state change success");
        } catch (error) {
            return errorResponse(res, error, 'Error activating catalogues');
        }
    }

    /**
     * Create news catalogues
     * @param {*} res
     * @param {ObjectId | string} catalogueId
     */
    doListCatalog = async (
        res: Response,
        catalogueId: string | ObjectId
    ): Promise<Catalogue | ResponseInterface | void> => {
        try {
            // filter catalogue
            const catalogue: Catalogue = await this.model.findOne({ _id: catalogueId })
            .populate({
                path: 'pages',
                populate: {
                    path: 'images.buttons.product',
                    model: 'products',
                },
            });
            const profile = await this.profileService.getProfileByUserId(catalogue.user_id as any);
            // reutrn response
            return createdResponse(res, { catalogue, profile }, "Catalogue information");
        } catch (error) {
            return errorResponse(res, error, 'Error show catalogues');
        }
    }

    /**
     * Create news catalogues
     * @param { * } res
     * @param { ObjectId | string } catalogueId
     * @param { any } body
     */
    downloadPdfAndSendEmail = async (res: Response, body: any): Promise<ResponseInterface | void> => {
        try {
            // filter catalogue
            const catalogue = await this.model.findOne({ _id: body.id })
            .populate('pages');
            await this.myFirstQueue.add({
                type: 'pdf',
                email: body.email,
                catalogue_id: body.id,
                pages: catalogue.pages,
                typeEmail: 'catalogue-download',
            });
            // reutrn response
            return createdResponse(res, { catalogue }, "Download proccess catalogue started.");
        } catch (error) {
            throw error;
        }
    }
}