import * as fs from 'fs';
import puppeteer from 'puppeteer';
import * as Handlebars from 'handlebars';
import { EmailService } from './aws/ses/email.service';
import { PdfActions, EmailData } from '../interfaces/generals.interface';

export class PdfService extends EmailService {
    public data: any = {};
    public htmlContent: any = null;
    public filledHTMLContent: any = null;

    constructor(data: any) {
        super();
        // Leer el contenido del archivo HTML
        this.data = data;
    }

    /**
     * Leer el contenido del archivo HTML
     * @param type 
     */
    prepareDocumentHtml = async (type: string, name: string, actions: PdfActions) => {
        // load pdf template
        switch (type) {
            case 'catalogue-download':
                this.htmlContent = await fs.readFileSync('./src/templates/pdfs/catalogue.pdf.html', 'utf8');
                break;

            default:
                break;
        }
        // prepare template data
        const template = Handlebars.compile(this.htmlContent);
        this.filledHTMLContent = template(this.data);
        // build pdf
        await this.buildPdf(name);
        // validate action
        const data: EmailData  = actions.data;
        switch (actions.type) {
            case 'send-email':
                await this.sendEmailWithAttachments(
                    data.email,
                    data.subject,
                    data.text as string,
                    data.attachments as any
                );
                break;
            default:
                break;
        }
    }

    /**
     * Build pdf file
     * @param name 
     */
    buildPdf = async (name: string) => {
        try {
             // Crear una instancia de Puppeteer
             let browser = null;
             if (process.env.APP_ENV === 'develop') {
                browser = await puppeteer.launch();
             } else {
                browser = await puppeteer.launch({
                    executablePath: '/opt/google/chrome',
                });
             }
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