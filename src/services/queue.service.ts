import Queue from "bull";
import { PdfService } from "./pdfs.service";

export class QueueService {
    myFirstQueue;

    constructor() {
        this.myFirstQueue = new Queue('catalogue-queue');
        this.setupQueueListeners();
        this.processQueue();
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
