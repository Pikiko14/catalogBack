import * as fs from 'fs';
import puppeteer from 'puppeteer';
import * as Handlebars from 'handlebars';

export class PdfService {
    public data: any = {};
    public htmlContent: any = null;
    public filledHTMLContent: any = null;

    constructor(data: any) {
        // Leer el contenido del archivo HTML
        this.data = data;
    }

    /**
     * Leer el contenido del archivo HTML
     * @param type 
     */
    prepareDocumentHtml = async (type: string, name: string) => {
        switch (type) {
            case 'catalogue-download':
                this.htmlContent = await fs.readFileSync('./src/templates/pdfs/catalogue.pdf.html', 'utf8');
                break;

            default:
                break;
        }
        const template = Handlebars.compile(this.htmlContent);
        this.filledHTMLContent = template(this.data);
        await this.buildPdf(name);
    }

    buildPdf = async (name: string) => {
        try {
             // Crear una instancia de Puppeteer
             const browser = await puppeteer.launch();
             const page = await browser.newPage();
             // Establecer el contenido HTML en la página
             await page.setContent(this.filledHTMLContent);
             // Generar el PDF
             await page.pdf({
                 path: `./uploads/pdfs/${name}.pdf`,
                 width: '400px',
                 height: '585px',
             });
             // Cerrar el navegador de Puppeteer
             await browser.close();
             console.log('PDF generado correctamente.');
        } catch (error) {
            throw error;
        }
    }
}