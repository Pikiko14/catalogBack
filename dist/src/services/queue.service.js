"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const bull_1 = __importDefault(require("bull"));
const pdfs_service_1 = require("./pdfs.service");
const pdf_to_img_handler_1 = require("./../utils/pdf-to-img.handler");
class QueueService {
    constructor() {
        this.setupQueueListeners = () => {
            // Escucha eventos de la cola (opcional)
            this.myFirstQueue.on('completed', (job, result) => {
                console.log(`El trabajo ${job.id} ha sido completado correctamente.`);
            });
            // log error on queue
            this.myFirstQueue.on('error', (error) => {
                console.log('Se ha producido un error en la cola:', error);
            });
        };
        this.processQueue = async () => {
            this.myFirstQueue.process(async (job, done) => {
                console.log(`Iniciando trabajo ${job.id}`);
                const { data } = job;
                try {
                    switch (data.type) {
                        // job for generate pdfs
                        case 'pdf':
                            const pdfService = new pdfs_service_1.PdfService(data);
                            if (data.typeEmail === 'catalogue-download') {
                                await pdfService.prepareDocumentHtml('catalogue-download', data.catalogue_id, {
                                    type: 'send-email',
                                    data: {
                                        email: data.email,
                                        attachments: [
                                            `pdfs/${data.catalogue_id}.pdf`
                                        ],
                                        subject: 'Download catalogue pdf',
                                        text: 'Hola, El siguiente correo contiene el PDF del catálogo que descargaste. Por favor, encuentra el archivo adjunto y revisa el contenido de este.',
                                    }
                                });
                            }
                            break;
                        // job with pages
                        case 'page':
                            if (data.action === 'process-pdf-to-image') {
                                await this.pdfToImage.processPdfToImg(data.file, data.catalogue_id);
                            }
                            break;
                        default:
                            break;
                    }
                    done();
                }
                catch (error) {
                    console.error('Error al ejecutar el job:', error);
                }
            });
        };
        this.myFirstQueue = new bull_1.default('catalogue-queue');
        this.setupQueueListeners();
        this.processQueue();
        this.pdfToImage = new pdf_to_img_handler_1.PdfToImage();
    }
}
exports.QueueService = QueueService;
