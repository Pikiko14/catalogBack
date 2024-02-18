import  * as fs from "fs"; // Importing file system module
import nodemailer from "nodemailer";
import * as aws from '@aws-sdk/client-ses';

export class EmailService {
    ses: aws.SESClient;
    from: string;
    path: string;

    constructor() {
        // Configurar el cliente SES con las variables de entorno para la región y las credenciales de AWS
        const sesConfig: aws.SESClientConfig = {
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_KEY as string,
                secretAccessKey: process.env.AWS_SECRET as string,
            }
        };
        this.path = process.cwd();
        this.ses = new aws.SES(sesConfig);
        this.from = 'maalhequi95@gmail.com';
    }

    /**
     * Send template or text email.
     * @param to 
     * @param subject 
     * @param textBody 
     * @param htmlBody 
     * @param cc 
     * @param replyTo 
     */
    async sendEmail(
        to: string | string[],
        subject: string,
        textBody?: string,
        htmlBody?: string,
        cc?: string[],
        replyTo?: string[],
    ): Promise<void> {
        try {
            const sendEmailCommand = new aws.SendEmailCommand({
                Destination: {
                    ToAddresses: Array.isArray(to) ? to : [to],
                    CcAddresses: cc || [],
                },
                Message: {
                    Body: {
                        Text: textBody ? { Charset: "UTF-8", Data: textBody } : undefined,
                        Html: htmlBody ? { Charset: "UTF-8", Data: htmlBody } : undefined,
                    },
                    Subject: { Charset: "UTF-8", Data: subject },
                },
                Source: to as string,
                ReplyToAddresses: replyTo || [],
            });

            // Se envía el comando utilizando el cliente SES de la clase
            const result = await this.ses.send(sendEmailCommand);
            console.log(`Email sent successfully: ${result.MessageId}`);
        } catch (error: any) {
            console.error(`Email sending failed: ${error.message}`);
        }
    }

    /**
     * send mail with attachment
     * @param from 
     * @param to 
     * @returns 
     */
    async sendEmailWithAttachments(to: string, subject: string, text: string, attachments: string[]): Promise<any> {
       try {
            // prepare transport 
            const transporter = nodemailer.createTransport({
                SES: { ses: this.ses, aws },
            });
            const from = this.from;
             // Convertir los nombres de los archivos a objetos de adjuntos
            const attachmentsData = await Promise.all(attachments.map(async (filename) => ({
                filename,
                content: await fs.readFileSync(`${this.path}/uploads/${filename}`)
            })));
            // send email to client
            const email = await  transporter.sendMail({
                from,
                to,
                subject,
                text,
                attachments: attachmentsData,
            });
            // delete file attachment
            attachments.map(async (filename) => {
                await fs.unlinkSync(`${this.path}/uploads/${filename}`);
            });
            // validate email
            if (email) {
                console.log(`Email sent successfully: ${email.messageId}`);
            }
       } catch (error: any) {
            console.error(`Email sending failed: ${error.message}`);
       }
    }
}
