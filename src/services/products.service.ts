import { Utils } from "../utils/utils";
import ProductModel from './../models/products.model';
import { MediaProductInterface, ProductInterface, ProviderMediaEnum, TypeMediaEnum } from './../interfaces/products.interface';
import { Response } from 'express';
import { errorResponse, notFountResponse, successResponse } from "../utils/api.responser";

export class ProductsService {
    model: any = ProductModel;
    utils: Utils;

    constructor(
    ) {
        this.utils = new Utils();
    }

    /**
     * get product by reference
     * @param { string } reference
     * @param { string } userId
     * @return { ProductInterface | void }
     */
    public async getProductByReference (reference: string, userId: string): Promise<ProductInterface | any> {
        const product = await this.model.findOne({ reference, user_id: userId });
        if (product) {
            return product;
        }
    }

    /**
     * get product by id
     * @param { string } userId
     * @param { string } productId
     * @return { ProductInterface | void }
     */
    public async getProductById (productId: string, userId: string): Promise<ProductInterface | any> {
        const product = await this.model.findOne({ _id: productId, user_id: userId });
        if (product) {
            return product;
        }
    }

    /**
     * Create product
     * @param { Response } res
     * @param { ProductInterface } body
     * @param { string } userId
     * @param { array } files
     */
    public async createProduct(res: Response, body: ProductInterface, userId: string, files: any): Promise<void> {
        try {
            // save product
            body.user_id = userId;
            const product = await this.model.create(body);
            // set images to products
            const path = await this.utils.getPath('products');
            let i = 0;
            for (const file of files) {
                const data: MediaProductInterface = {
                    path: `/${path}/${file.filename}`,
                    type: TypeMediaEnum.image,
                    provider: ProviderMediaEnum.owner,
                }
                product.medias.push(data);
                if (i == 0) {
                    product.default_image = data;
                }
                i++;
            }
            await product.save();
            return successResponse(res, product, 'Product created success');
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * List products
     * @param { Response } res
     * @param { string } userId
     */
    public async listProducts(
        res: Response,
        userId: string,
        { page, perPage, search }:{ page: number, perPage: number, search: string }
    ): Promise<ProductInterface[] | void> {
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
                        { reference: searchRegex }
                    ],
                };
            }
            // do query
            const products = await this.model.find(query, 'id name default_image')
            .skip(skip)
            .limit(perPage)
            .populate({
                path: 'categories',
                select: 'name'  // Solo obtén el campo 'name' de las categorías
            });
            // Count model by user
            const totalProducts = await this.model.countDocuments().merge(query);
            const totalPages = Math.ceil(totalProducts / perPage);
            // return data
            return successResponse(res, { products, totalPages, totalProducts }, 'List Categories');
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * Delete product
     * @param { Response } res
     * @param { string } userId
     * @param { string } productId
     * @return
     */
    public async deleteProduct(res: Response, userId: string, productId: string) {
        try {
            const product = await this.model.findOneAndDelete({ _id: productId, user_id: userId  });
            if (!product) {
                return errorResponse(
                    res,
                    { productId, userId } ,
                    'Product not found or does not belong to the user'
                );
            }
            return successResponse(res, product, 'Product deleted successfully');
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete product
     * @param { Response } res
     * @param { string } userId
     * @param { string } productId
     * @return
     */
    public async showProduct(res: Response, userId: string, productId: string) {
        try {
            const product = await this.model.findOne({ _id: productId, user_id: userId  });
            if (!product) {
                return errorResponse(
                    res,
                    { productId, userId } ,
                    'Product not found or does not belong to the user'
                );
            }
            return successResponse(res, product, 'Product show successfully');
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update product
     * @param {Response} res
     * @param {ProductInterface} body
     * @param {string} userId
     * @param {string} productId
     * @param {array} files
     */
    public async updateProducts(res: Response, body: ProductInterface, userId: string, files: any, productId: string): Promise<void> {
        try {
            const product = await this.model.findOneAndUpdate(
                { _id: productId, user_id: userId },
                body,
                { new: true }
            );
            if (!product) {
                return errorResponse(res, { productId, userId }, 'Product not found or does not belong to the user');
            }
            // delete media
            const deleteDefaultImg = await this.handleDeletedMedia(product);
            if (deleteDefaultImg) {
                product.default_image = null;
            }
            // process new media
            if (files.length > 0) {
                const newMedias = await this.processNewMedia(files);
                product.medias.push(...newMedias);
            }
            // save media data
            await product.save();
            return successResponse(res, product, 'Product updated successfully');
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * handleDeleteMedia
     * @param product 
     */
    public async handleDeletedMedia(product: any): Promise<void | boolean> {
        let deleteDefaultImg = false;
        if (product.medias) {
            const mediaToDelete = product.medias.filter((data: MediaProductInterface) => data.deleted === true);
            for (const media of mediaToDelete) {
                if (media.path === product.default_image?.path) {
                    deleteDefaultImg = true;
                }
                await this.utils.deleteItemFromStorage(media.path);
            }
            const mediasNoDeleteds = product.medias.filter((data: MediaProductInterface) => data.deleted !== true);
            const productBd = await this.model.findOneAndUpdate(
                { _id: product.id },
                { medias: mediasNoDeleteds },
                { new: true, }
            );
        }
        return deleteDefaultImg;
    }

    /**
     * Process medias product
     * @param files 
     * @returns 
     */
    private async processNewMedia(files: any[]): Promise<MediaProductInterface[]> {
        const path = await this.utils.getPath('products');
        return files.map(file => ({
            path: `/${path}/${file.filename}`,
            type: TypeMediaEnum.image,
            provider: ProviderMediaEnum.owner,
        }));
    }

    /**
     * Set product default image
     * @param res 
     * @param productId 
     * @param media 
     * @returns 
     */
    public async setDefaultImg(res: Response, productId: string, media: MediaProductInterface) {
        try {
            const product = await this.model.findOneAndUpdate(
                { _id: productId },
                {
                    default_image: media,
                },
                {
                    new: true
                }
            );
            if (!product) {
                return notFountResponse(res, { productId }, 'Product not found');
            }
            // return data
            return successResponse(res, product, 'Product default image change success.');
        } catch (error) {
            throw error;
        }
    }
}