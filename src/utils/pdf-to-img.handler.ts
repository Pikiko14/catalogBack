import { Utils } from "./utils";
import { fromPath } from "pdf2pic";
import { PagesService } from "../services/pages.service";
import { PagesInterface } from "../interfaces/pages.interface";
import { WriteImageResponse } from "pdf2pic/dist/types/convertResponse";
import { CatalogueService } from "../services/catalogues.service";

export class PdfToImage {
    type: string;
    utils: Utils;
    optionsPdfToImg: any;

    constructor() {
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
                results.map(async (data: WriteImageResponse, index: number) => {
                    const pageDate: PagesInterface = {
                        number: (index + 1) as number,
                        type: this.type,
                        catalogue_id: catalogId as any,
                        images: []
                    } 
                    const image = {
                        path: `/${path}/${data.name}`,
                        order: index + 1,
                        buttons: []
                    }
                    pageDate.images.push(image);
                    const pageService = new PagesService();
                    const page = await pageService.savePageFromPdfToImg(pageDate);
                    const catalogService = new CatalogueService();
                    await catalogService.pushPage(true as any, catalogId as any, page._id);
                })
            }
            // delete pdf from temp storage
            await this.utils.deleteItemFromStorage(`pdfs/${file.filename}`);
            this.optionsPdfToImg.savePath = `${__dirname}../../../uploads/`;
        } catch (error: any) {
            throw error.message;  
        }
    }
}