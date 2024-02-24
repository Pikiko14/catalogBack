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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const fs = __importStar(require("fs"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const Handlebars = __importStar(require("handlebars"));
const email_service_1 = require("./aws/ses/email.service");
class PdfService extends email_service_1.EmailService {
    constructor(data) {
        super();
        this.data = {};
        this.htmlContent = null;
        this.filledHTMLContent = null;
        /**
         * Leer el contenido del archivo HTML
         * @param type
         */
        this.prepareDocumentHtml = async (type, name, actions) => {
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
            const data = actions.data;
            switch (actions.type) {
                case 'send-email':
                    await this.sendEmailWithAttachments(data.email, data.subject, data.text, data.attachments);
                    break;
                default:
                    break;
            }
        };
        /**
         * Build pdf file
         * @param name
         */
        this.buildPdf = async (name) => {
            try {
                // Crear una instancia de Puppeteer
                const browser = await puppeteer_1.default.launch();
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
            }
            catch (error) {
                throw error;
            }
        };
        // Leer el contenido del archivo HTML
        this.data = data;
    }
}
exports.PdfService = PdfService;
