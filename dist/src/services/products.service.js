"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const utils_1 = require("../utils/utils");
const products_model_1 = __importDefault(require("./../models/products.model"));
const products_interface_1 = require("./../interfaces/products.interface");
const api_responser_1 = require("../utils/api.responser");
class ProductsService {
    constructor() {
        this.model = products_model_1.default;
        this.utils = new utils_1.Utils();
    }
    /**
     * get product by reference
     * @param { string } reference
     * @param { string } userId
     * @return { ProductInterface | void }
     */
    async getProductByReference(reference, userId) {
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
    async getProductById(productId, userId) {
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
    async createProduct(res, body, userId, files) {
        try {
            // save product
            body.user_id = userId;
            const product = await this.model.create(body);
            // set images to products
            const path = await this.utils.getPath('products');
            let i = 0;
            for (const file of files) {
                const data = {
                    path: `/${path}/${file.filename}`,
                    type: products_interface_1.TypeMediaEnum.image,
                    provider: products_interface_1.ProviderMediaEnum.owner,
                };
                product.medias.push(data);
                if (i == 0) {
                    product.default_image = data;
                }
                i++;
            }
            await product.save();
            return (0, api_responser_1.successResponse)(res, product, 'Product created success');
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List products
     * @param { Response } res
     * @param { string } userId
     */
    async listProducts(res, userId, { page, perPage, search }) {
        try {
            // init pagination data
            page = page || 1;
            perPage = perPage || 12;
            const skip = (page - 1) * perPage;
            // Iniciar consulta
            let query = { user_id: userId };
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
                .limit(perPage);
            // Count model by user
            const totalProducts = await this.model.countDocuments().merge(query);
            const totalPages = Math.ceil(totalProducts / perPage);
            // return data
            return (0, api_responser_1.successResponse)(res, { products, totalPages }, 'List Categories');
        }
        catch (error) {
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
    async deleteProduct(res, userId, productId) {
        try {
            const product = await this.model.findOneAndDelete({ _id: productId, user_id: userId });
            if (!product) {
                return (0, api_responser_1.errorResponse)(res, { productId, userId }, 'Product not found or does not belong to the user');
            }
            return (0, api_responser_1.successResponse)(res, product, 'Product deleted successfully');
        }
        catch (error) {
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
    async showProduct(res, userId, productId) {
        try {
            const product = await this.model.findOne({ _id: productId, user_id: userId });
            if (!product) {
                return (0, api_responser_1.errorResponse)(res, { productId, userId }, 'Product not found or does not belong to the user');
            }
            return (0, api_responser_1.successResponse)(res, product, 'Product show successfully');
        }
        catch (error) {
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
    async updateProducts(res, body, userId, files, productId) {
        try {
            const product = await this.model.findOneAndUpdate({ _id: productId, user_id: userId }, body, { new: true });
            if (!product) {
                return (0, api_responser_1.errorResponse)(res, { productId, userId }, 'Product not found or does not belong to the user');
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
            return (0, api_responser_1.successResponse)(res, product, 'Product updated successfully');
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * handleDeleteMedia
     * @param product
     */
    async handleDeletedMedia(product) {
        var _a;
        let deleteDefaultImg = false;
        if (product.medias) {
            const mediaToDelete = product.medias.filter((data) => data.deleted === true);
            for (const media of mediaToDelete) {
                if (media.path === ((_a = product.default_image) === null || _a === void 0 ? void 0 : _a.path)) {
                    deleteDefaultImg = true;
                }
                await this.utils.deleteItemFromStorage(media.path);
            }
            const mediasNoDeleteds = product.medias.filter((data) => data.deleted !== true);
            const productBd = await this.model.findOneAndUpdate({ _id: product.id }, { medias: mediasNoDeleteds }, { new: true, });
        }
        return deleteDefaultImg;
    }
    /**
     * Process medias product
     * @param files
     * @returns
     */
    async processNewMedia(files) {
        const path = await this.utils.getPath('products');
        return files.map(file => ({
            path: `/${path}/${file.filename}`,
            type: products_interface_1.TypeMediaEnum.image,
            provider: products_interface_1.ProviderMediaEnum.owner,
        }));
    }
    /**
     * Set product default image
     * @param res
     * @param productId
     * @param media
     * @returns
     */
    async setDefaultImg(res, productId, media) {
        try {
            const product = await this.model.findOneAndUpdate({ _id: productId }, {
                default_image: media,
            }, {
                new: true
            });
            if (!product) {
                return (0, api_responser_1.notFountResponse)(res, { productId }, 'Product not found');
            }
            // return data
            return (0, api_responser_1.successResponse)(res, product, 'Product default image change success.');
        }
        catch (error) {
            throw error;
        }
    }
}
exports.ProductsService = ProductsService;
