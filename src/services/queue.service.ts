import Queue from "bull";
import { PdfService } from "./pdfs.service";
import { PdfToImage } from './../utils/pdf-to-img.handler';

export class QueueService {
    myFirstQueue;
    pdfToImage: PdfToImage;

    constructor() {
        this.myFirstQueue = new Queue('catalogue-queue');
        this.setupQueueListeners();
        this.processQueue();
        this.pdfToImage = new PdfToImage();
    }

    setupQueueListeners = () => {
        // Escucha eventos de la cola (opcional)
        this.myFirstQueue.on('completed', (job, result: any) => {
            console.log(
                `El trabajo ${job.id} ha sido completado correctamente.`
            );
        });

        // log error on queue
        this.myFirstQueue.on('error', (error) => {
            console.log('Se ha producido un error en la cola:', error);
        });
    }

    processQueue = async () => {
        this.myFirstQueue.process(async (job, done) => {
            const { data } = job;
            try {
                switch (data.type) {
                    // job for generate pdfs
                    case 'pdf':
                        const pdfService = new PdfService(data);
                        if (data.typeEmail === 'catalogue-download') {
                            await pdfService.prepareDocumentHtml(
                                'catalogue-download',
                                data.catalogue_id,
                                {
                                    type: 'send-email',
                                    data: {
                                        email: data.email,
                                        attachments: [
                                            `pdfs/${data.catalogue_id}.pdf`
                                        ],
                                        subject: 'Download catalogue pdf',
                                        text: 'Hola, El siguiente correo contiene el PDF del catálogo que descargaste. Por favor, encuentra el archivo adjunto y revisa el contenido de este.',
                                    }
                                }
                            );
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
            } catch (error) {
                console.error('Error al generar el PDF:', error);
            }
        });
    }
}
