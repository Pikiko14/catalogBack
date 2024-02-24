import { Response, Request } from "express";
import { RequestExt } from "../interfaces/req-ext";
import { body, matchedData } from "express-validator";
import { errorResponse } from "../utils/api.responser";
import { ProductsService } from "../services/products.service";
import { MediaProductInterface, ProductInterface } from "../interfaces/products.interface";

export class ProductsController {
    service: ProductsService;

    constructor() {
        this.service = new ProductsService();
    }

    /**
     * Create products
     * @param req
     * @param res
     * @returns
     */
    createProducts= async (req: RequestExt, res: Response) => {
        try {
            const files: any = req.files;
            const body = matchedData(req) as ProductInterface;
            const userId = req.user.parent || req.user._id;
            await this.service.createProduct(res, body, userId, files);
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error create products');
        }
    }

    /**
     * List products
     * @param req
     * @param res
     * @returns
     */
    listProducts= async (req: RequestExt, res: Response) => {
        try {
            const { page, perPage, search } = req.query as any;
            const userId = req.user.parent || req.user._id;
            await this.service.listProducts(res, userId, { page, perPage, search });
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error listing products');
        }
    }

     /**
     * Update products
     * @param req
     * @param res
     * @returns
     */
     updateProducts= async (req: RequestExt, res: Response) => {
        try {
            // get body data and clean data
            const files: any = req.files;
            const body = matchedData(req) as ProductInterface;
            const userId = req.user.parent || req.user._id;
            const { productId } = req.params;
            // update product
            await this.service.updateProducts(res, body, userId, files, productId);
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error updating products');
        }
    }

    /**
     * Delete products
     * @param req
     * @param res
     * @returns
     */
    deleteProducts = async (req: RequestExt, res: Response) => {
        try {
            const { productId } = req.params;
            const userId = req.user.parent || req.user._id;
            await this.service.deleteProduct(res, userId, productId);
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error deleting products');
        }
    }

     /**
     * show products
     * @param req
     * @param res
     * @returns
     */
     showProduct = async (req: RequestExt, res: Response) => {
        try {
            const { productId } = req.params;
            const userId = req.user.parent || req.user._id;
            await this.service.showProduct(res, userId, productId);
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error show products');
        }
    }

    /**
     * set default image product
     * @param req
     * @param res
     * @returns
     */
    setDefaultImg = async (req: RequestExt, res: Response) => {
        try {
            const { productId } = req.params;
            const body = matchedData(req) as MediaProductInterface;
            await this.service.setDefaultImg(res, productId, body);
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error set default image on product.');
        }
    }

     /**
     * show products
     * @param req
     * @param res
     * @returns
     */
    showProductByFront = async (req: RequestExt, res: Response) => {
        try {
            const { productId } = req.params;
            await this.service.showProductByFront(res, productId);
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error show products');
        }
    }

    /**
     * add product to cart
     * @param req
     * @param res
     * @returns
     */
    addProductToCart = async (req: RequestExt, res: Response) => {
        try {
            const body = matchedData(req);
            await this.service.addProductToCart(res, body);
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error adding to cart');
        }
    }

    /**
     * add product to cart
     * @param req
     * @param res
     * @returns
     */
    filterProducts = async (req: RequestExt, res: Response) => {
        try {
            const { catalogue_id, product, categories } = req.query as any;
            await this.service.filterProducts(res, product, catalogue_id, categories);
        } catch (error: any) {
            return errorResponse(res, error.message, 'Error product search');
        }
    }
}
