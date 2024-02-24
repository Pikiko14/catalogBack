"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfToImage = void 0;
const fs = __importStar(require("fs"));
const utils_1 = require("./utils");
const pdf2pic_1 = require("pdf2pic");
const pages_service_1 = require("../services/pages.service");
const s3_service_1 = require("../services/aws/s3/s3.service");
const email_service_1 = require("../services/aws/ses/email.service");
const catalogues_service_1 = require("../services/catalogues.service");
class PdfToImage extends email_service_1.EmailService {
    constructor() {
        super();
        /**
         * Process pdf to image transform
         * @param { * } file
         * @param { string } catalogId
         */
        this.processPdfToImg = async (file, catalogId) => {
            try {
                const path = await this.utils.getPath('images'); // get user path
                this.optionsPdfToImg.savePath = `${this.optionsPdfToImg.savePath}/${path}/`; // edit path to save
                this.optionsPdfToImg.saveFilename = `img_catalog_${catalogId}_${new Date().getTime().toString()}`;
                const convert = (0, pdf2pic_1.fromPath)(file.path, this.optionsPdfToImg); // conver images...
                const results = await convert.bulk(-1, { responseType: "image" }); // get images array
                // generamos la pagina del catalogo en base a cada imagen convertida
                if (results.length > 0) {
                    let index = 0;
                    for (const data of results) {
                        const pageDate = {
                            number: (index + 1),
                            type: this.type,
                            catalogue_id: catalogId,
                            images: []
                        };
                        let image = {};
                        await setTimeout(async () => {
                            const buffer = await fs.readFileSync(`${process.cwd()}/uploads/${path}/${data.name}`);
                            buffer.originalname = `img_catalog_${catalogId}_${new Date().getTime().toString()}.webp`;
                            const s3Service = new s3_service_1.S3Service();
                            const fileS3 = await s3Service.uploadSingleObject(buffer);
                            image = {
                                path: fileS3,
                                order: index + 1,
                                buttons: []
                            };
                            pageDate.images.push(image);
                            const pageService = new pages_service_1.PagesService();
                            const page = await pageService.savePageFromPdfToImg(pageDate);
                            const catalogService = new catalogues_service_1.CatalogueService();
                            await catalogService.pushPage(true, catalogId, page._id);
                            await this.utils.deleteItemFromStorage(`/${path}/${data.name}`);
                            index++;
                        }, 500);
                    }
                }
                // delete pdf from temp storage
                await this.utils.deleteItemFromStorage(`pdfs/${file.filename}`);
                this.optionsPdfToImg.savePath = `${__dirname}../../../uploads/`;
            }
            catch (error) {
                throw error.message;
            }
        };
        this.type = 'simple';
        this.optionsPdfToImg = {
            density: 100,
            savePath: `${__dirname}../../../uploads/`,
            format: 'png',
            width: 500,
            height: 720
        };
        this.utils = new utils_1.Utils();
    }
}
exports.PdfToImage = PdfToImage;
