import * as fs from 'fs';
import { Utils } from "./utils";
import { fromPath } from "pdf2pic";
import { PagesService } from "../services/pages.service";
import { S3Service } from '../services/aws/s3/s3.service';
import { PagesInterface } from "../interfaces/pages.interface";
import { EmailService } from '../services/aws/ses/email.service';
import { CatalogueService } from "../services/catalogues.service";

export class PdfToImage extends EmailService {
    type: string;
    utils: Utils;
    optionsPdfToImg: any;

    constructor() {
        super();
        this.type = 'simple';
        this.optionsPdfToImg = {
            density: 100,
            savePath: `${__dirname}../../../uploads/`,
            format: 'png',
            width: 500,
            height: 720
        };
        this.utils = new Utils();
    }

    /**
     * Process pdf to image transform
     * @param { * } file 
     * @param { string } catalogId
     */
    processPdfToImg = async (file: any, catalogId: string) => {
        try {
            const path = await this.utils.getPath('images'); // get user path
            this.optionsPdfToImg.savePath = `${this.optionsPdfToImg.savePath}/${path}/`; // edit path to save
            this.optionsPdfToImg.saveFilename = `img_catalog_${catalogId}_${new Date().getTime().toString()}`;
            const convert = fromPath(file.path, this.optionsPdfToImg); // conver images...
            const results = await convert.bulk(-1, { responseType: "image" }); // get images array
            // generamos la pagina del catalogo en base a cada imagen convertida
            if (results.length > 0) {
                let index = 0;
                for (const data of results) {
                    const pageDate: PagesInterface = {
                        number: (index + 1) as number,
                        type: this.type,
                        catalogue_id: catalogId as any,
                        images: []
                    }
                    let image: any = {};
                    await setTimeout(async () => {
                        const buffer: any = await fs.readFileSync(`${process.cwd()}/uploads/${path}/${data.name}`);
                        buffer.originalname = `img_catalog_${catalogId}_${new Date().getTime().toString()}.webp`;
                        const s3Service = new S3Service();
                        const fileS3 = await s3Service.uploadSingleObject(buffer);
                        image = {
                            path: fileS3,
                            order: index + 1,
                            buttons: []
                        }
                        pageDate.images.push(image);
                        const pageService = new PagesService();
                        const page = await pageService.savePageFromPdfToImg(pageDate);
                        const catalogService = new CatalogueService();
                        await catalogService.pushPage(true as any, catalogId as any, page._id);
                        await this.utils.deleteItemFromStorage(`/${path}/${data.name}`);
                        index++;
                    }, 500);
                }
            }
            // delete pdf from temp storage
            await this.utils.deleteItemFromStorage(`pdfs/${file.filename}`);
            this.optionsPdfToImg.savePath = `${__dirname}../../../uploads/`;
        } catch (error: any) {
            throw error.message;  
        }
    }
}