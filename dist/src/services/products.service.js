"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const utils_1 = require("../utils/utils");
const products_model_1 = __importDefault(require("./../models/products.model"));
const pages_models_1 = __importDefault(require("../models/pages.models"));
const s3_service_1 = require("./aws/s3/s3.service");
const api_responser_1 = require("../utils/api.responser");
const products_interface_1 = require("./../interfaces/products.interface");
class ProductsService {
    constructor() {
        this.model = products_model_1.default;
        this.pagesModel = pages_models_1.default;
        this.utils = new utils_1.Utils();
        this.s3Service = new s3_service_1.S3Service();
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
    async createProduct(res, body, userId, files) {
        try {
            // save product
            body.user_id = userId;
            let product = await this.model.create(body);
            // set images to products
            let i = 0;
            const filesArray = await this.s3Service.uploadMultipleFiles(files);
            for (const file of filesArray) {
                const data = {
                    path: file,
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
            // get fresh data
            product = await this.getProductById(product._id, product.user_id);
            // return data
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
            const products = await this.model.find(query, 'id name default_image reference')
                .skip(skip)
                .limit(perPage)
                .populate({
                path: 'categories',
                select: 'name' // Solo obtén el campo 'name' de las categorías
            });
            // Count model by user
            const totalProducts = await this.model.countDocuments().merge(query);
            const totalPages = Math.ceil(totalProducts / perPage);
            // return data
            return (0, api_responser_1.successResponse)(res, { products, totalPages, totalProducts }, 'List Categories');
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
            let product = await this.model.findOneAndUpdate({ _id: productId, user_id: userId }, body, { new: true });
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
            // get fresh data
            product = await this.getProductById(product._id, product.user_id);
            // return data
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
                if (media.path && media.path.includes('.s3.us-east-2')) {
                    const key = media.path.split('/').pop();
                    await this.s3Service.deleteSingleObject(key);
                }
                else {
                    await this.utils.deleteItemFromStorage(media.path);
                }
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
        const filesArray = await this.s3Service.uploadMultipleFiles(files);
        return filesArray.map(file => ({
            path: file,
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
            let product = await this.model.findOneAndUpdate({ _id: productId }, {
                default_image: media,
            }, {
                new: true
            });
            if (!product) {
                return (0, api_responser_1.notFountResponse)(res, { productId }, 'Product not found');
            }
            // get fresh data
            product = await this.getProductById(product._id, product.user_id);
            // return data
            return (0, api_responser_1.successResponse)(res, product, 'Product default image change success.');
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
    async showProductByFront(res, productId) {
        try {
            const product = await this.model.findOne({ _id: productId })
                .populate('categories');
            if (!product) {
                return (0, api_responser_1.errorResponse)(res, { productId }, 'Product not found');
            }
            return (0, api_responser_1.successResponse)(res, product, 'Product show successfully');
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * get product by id out user
     * @param { string } productId
     * @return { ProductInterface | void }
     */
    async getProductByIdOutUser(productId) {
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
    async addProductToCart(res, body) {
        try {
            // up added to cart on products
            const results = await this.model.updateMany({ _id: { $in: body.products } }, { $inc: { count_add_to_cart: 1 } });
            // return data
            return (0, api_responser_1.successResponse)(res, results, 'Products added to cart successfully');
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * add product more sell status
     * @param { * } productIds
     */
    async addMoreSellStatus(productIds) {
        try {
            // up added to cart on products
            const results = await this.model.updateMany({ _id: { $in: productIds } }, { $inc: { count_order_finish: 1 } });
            // return data
            return results;
        }
        catch (error) {
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
    async filterProducts(res, productName, catalogue_id, categories) {
        try {
            let pages = [];
            if (productName || categories) {
                let productFilter = {};
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
                const productIds = products.map((product) => product._id);
                // Buscar las páginas que contienen los productos encontrados
                pages = await this.pagesModel.find({ 'images.buttons.product': { $in: productIds }, catalogue_id: catalogue_id })
                    .populate({
                    path: 'images.buttons.product',
                    model: 'products', // Nombre del modelo de Productos
                });
            }
            else {
                pages = await this.pagesModel.find({ catalogue_id: catalogue_id })
                    .populate({
                    path: 'images.buttons.product',
                    model: 'products', // Nombre del modelo de Productos
                });
            }
            return (0, api_responser_1.successResponse)(res, pages, 'Result data');
        }
        catch (error) {
            throw error;
        }
    }
}
exports.ProductsService = ProductsService;
