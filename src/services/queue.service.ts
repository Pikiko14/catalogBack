import Queue from "bull";
import * as fs from 'fs';
import { PdfService } from "./pdfs.service";
import { EmailService } from './aws/ses/email.service';
import { PdfToImage } from './../utils/pdf-to-img.handler';

export class QueueService {
    myFirstQueue;
    pdfToImage: PdfToImage;
    public path: string = `${process.cwd()}/src/templates`;
    public emailService: EmailService;

    constructor() {
        this.myFirstQueue = new Queue('catalogue-queue');
        this.setupQueueListeners();
        this.processQueue();
        this.pdfToImage = new PdfToImage();
        this.emailService = new EmailService();
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
            console.log(`Iniciando trabajo ${job.id}`);
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
                                        profile: data.profile,
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
                    // job for auth
                    case 'auth':
                        if (data.action === 'send-email-recovery') {
                            let htmlEmail = fs.readFileSync(`${this.path}/emails/recovery-password.html`, 'utf8');
                            const urlRecovery = `${process.env.APP_URL}/login?recovery=true&token=${data.token}`
                            htmlEmail = htmlEmail.replace('{{recoveryUrl}}', urlRecovery as string);
                            await this.emailService.sendEmail(
                                data.email,
                                'Recovery password',
                                undefined,
                                htmlEmail,
                            );
                        }
                        break;
                    default:
                        break;
                }
                done();
            } catch (error: any) {
                console.error('Error al ejecutar el job:', error);
                done(error);
            }
        });
    }
}
