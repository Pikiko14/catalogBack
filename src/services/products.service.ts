import { Utils } from "../utils/utils";
import ProductModel from './../models/products.model';
import { Response } from 'express';
import PagesModel from "../models/pages.models";
import { S3Service } from "./aws/s3/s3.service";
import { Catalogue } from "../interfaces/catalogues.interface";
import { errorResponse, notFountResponse, successResponse } from "../utils/api.responser";
import { MediaProductInterface, ProductInterface, ProviderMediaEnum, TypeMediaEnum } from './../interfaces/products.interface';

export class ProductsService {
    utils: Utils;
    model: any = ProductModel;
    pagesModel: any = PagesModel;
    s3Service: S3Service;

    constructor(
    ) {
        this.utils = new Utils();
        this.s3Service = new S3Service();
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
        const product = await this.model.findOne({ _id: productId, user_id: userId }, 'id name default_image reference')
        .populate({
            path: 'categories',
            select: 'name'
        });
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
            let product = await this.model.create(body);
            // set images to products
            let i = 0;
            const filesArray = await this.s3Service.uploadMultipleFiles(files);
            for (const file of filesArray) {
                const data: MediaProductInterface = {
                    path: file,
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
            // get fresh data
            product = await this.getProductById(product._id, product.user_id);
            // return data
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
            const products = await this.model.find(query, 'id name default_image reference')
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
            let product = await this.model.findOneAndUpdate(
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
            // get fresh data
            product = await this.getProductById(product._id, product.user_id);
            // return data
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
                if (media.path && media.path.includes('.s3.us-east-2')) {
                    const key: string = media.path.split('/').pop();
                    await this.s3Service.deleteSingleObject(key);
                } else {
                    await this.utils.deleteItemFromStorage(media.path);
                }
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
        const filesArray = await this.s3Service.uploadMultipleFiles(files);
        return filesArray.map(file => ({
            path: file,
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
            let product = await this.model.findOneAndUpdate(
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
            // get fresh data
            product = await this.getProductById(product._id, product.user_id);
            // return data
            return successResponse(res, product, 'Product default image change success.');
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
    public async showProductByFront(res: Response, productId: string) {
        try {
            const product = await this.model.findOne({ _id: productId  })
            .populate('categories');
            if (!product) {
                return errorResponse(
                    res,
                    { productId } ,
                    'Product not found'
                );
            }
            return successResponse(res, product, 'Product show successfully');
        } catch (error) {
            throw error;
        }
    }

    /**
     * get product by id out user
     * @param { string } productId
     * @return { ProductInterface | void }
     */
    public async getProductByIdOutUser (productId: string): Promise<ProductInterface | any> {
        const product = await this.model.findOne({ _id: productId }, 'id name default_image reference')
        .populate({
            path: 'categories',
            select: 'name'
        });
        if (product) {
            return product;
        }
        return null;
    }

    /**
     * Delete product
     * @param { Response } res
     * @param { string[] } product
     * @return
     */
    public async addProductToCart(res: Response, body: any) {
        try {
            // up added to cart on products
            const results = await this.model.updateMany(
                { _id: { $in: body.products } },
                { $inc: { count_add_to_cart: 1 } }
            );
            // return data
            return successResponse(res, results, 'Products added to cart successfully');
        } catch (error) {
            throw error;
        }
    }

    /**
     * add product more sell status
     * @param { * } productIds 
     */
    public async addMoreSellStatus(productIds: string[]) {
        try {
            // up added to cart on products
            const results = await this.model.updateMany(
                { _id: { $in: productIds } },
                { $inc: { count_order_finish: 1 } }
            );
            // return data
            return results;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Search product
     * @param productName 
     * @param catalogue_id 
     * @param categories 
     * @returns 
     */
    public async filterProducts(res: Response, productName: string, catalogue_id: string, categories: any): Promise<any> {
        try {
            let pages: string[] = [];
            if (productName || categories) {
                let productFilter: any = {};
                // Si productName está definido, agregar filtro por nombre
                if (productName) {
                    productFilter.name = { $regex: productName, $options: 'i' };
                }
                // Si categories están definidas, agregar filtro por categorías
                if (categories && categories.length > 0) {
                    productFilter.categories = { $in: JSON.parse(categories) };
                }
                // Buscar productos que cumplan con los filtros
                const products = await this.model.find(productFilter, '_id');
                // Obtener los IDs de los productos encontrados
                const productIds = products.map((product: ProductInterface) => product._id);
                // Buscar las páginas que contienen los productos encontrados
                pages = await this.pagesModel.find({ 'images.buttons.product': { $in: productIds }, catalogue_id: catalogue_id })
                .populate({
                    path: 'images.buttons.product',
                    model: 'products', // Nombre del modelo de Productos
                });
            } else {
                pages = await this.pagesModel.find({ catalogue_id: catalogue_id })
                .populate({
                    path: 'images.buttons.product',
                    model: 'products', // Nombre del modelo de Productos
                });
            }
            return successResponse(res, pages, 'Result data');
        } catch (error) {
            throw error;
        }
    }

    /**
     * show product by id
     * @param res
     * @param productId
     * @returns
     */
    showProductById = async (res: Response, productId: string) => {
        try {
            const product = await this.model.findOne({ _id: productId });
            if (!product) {
                return errorResponse(
                    res,
                    { productId } ,
                    'Product not found.'
                );
            }
            return successResponse(res, product, 'Product show successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error show products');
        }
    }
}