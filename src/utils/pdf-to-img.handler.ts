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
            savePath: `${process.cwd()}/uploads/`,
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
            const path = await this.utils.getPath('images'); // obtener el directorio de imágenes
            // Configurar el directorio de almacenamiento para las imágenes
            this.optionsPdfToImg.savePath = `${this.optionsPdfToImg.savePath}/${path}/`; // edit path to save
            this.optionsPdfToImg.saveFilename = `img_catalog_${catalogId}_${new Date().getTime().toString()}`; // set name pf image 
            const convert = fromPath(file.path, this.optionsPdfToImg); // convertir a imágenes
            const results = await convert.bulk(-1, { responseType: "image" }); // obtener imágenes
            // Verificar si se obtuvieron resultados
            if (results.length > 0) {
                for (let index = 0; index < results.length; index++) {
                    const data = results[index];
                    const pageNumber = index + 1;
                    // Leer la imagen convertida
                    const buffer = await fs.promises.readFile(`${this.optionsPdfToImg.savePath}/${data.name}`);
                    // Subir la imagen a S3
                    const s3Service = new S3Service();
                    const fileS3 = await s3Service.uploadSingleObject(buffer);
                    // Construir objeto de imagen
                    const image = {
                        path: fileS3,
                        order: pageNumber,
                        buttons: []
                    };
                    // Guardar la página en la base de datos
                    const pageDate: PagesInterface = {
                        number: pageNumber,
                        type: this.type,
                        catalogue_id: catalogId as any,
                        images: [image]
                    };
                    const pageService = new PagesService();
                    const page = await pageService.savePageFromPdfToImg(pageDate);
                    // Asociar la página al catálogo
                    const catalogService = new CatalogueService();
                    await catalogService.pushPage(true as any, catalogId as any, page._id);
                    // Eliminar la imagen convertida del almacenamiento temporal
                    await this.utils.deleteItemFromStorage(`/${path}/${data.name}`);
                    // time out
                    setTimeout(() => {
                        console.log(`Se ha subido la imagen: ${data.name}`)
                    }, 2000)
                }
            }
    
            // Eliminar el PDF del almacenamiento temporal
            await this.utils.deleteItemFromStorage(`pdfs/${file.filename}`);
    
            // Restaurar el directorio de almacenamiento predeterminado
            this.optionsPdfToImg.savePath = `${process.cwd()}/uploads/`;
        } catch (error: any) {
            throw error.message;
        }
    }
}