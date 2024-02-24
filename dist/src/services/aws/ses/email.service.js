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
exports.EmailService = void 0;
const fs = __importStar(require("fs")); // Importing file system module
const nodemailer_1 = __importDefault(require("nodemailer"));
const aws = __importStar(require("@aws-sdk/client-ses"));
class EmailService {
    constructor() {
        // Configurar el cliente SES con las variables de entorno para la región y las credenciales de AWS
        const sesConfig = {
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_KEY,
                secretAccessKey: process.env.AWS_SECRET,
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
    async sendEmail(to, subject, textBody, htmlBody, cc, replyTo) {
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
                Source: to,
                ReplyToAddresses: replyTo || [],
            });
            // Se envía el comando utilizando el cliente SES de la clase
            const result = await this.ses.send(sendEmailCommand);
            console.log(`Email sent successfully: ${result.MessageId}`);
        }
        catch (error) {
            console.error(`Email sending failed: ${error.message}`);
        }
    }
    /**
     * send mail with attachment
     * @param from
     * @param to
     * @returns
     */
    async sendEmailWithAttachments(to, subject, text, attachments) {
        try {
            // prepare transport 
            const transporter = nodemailer_1.default.createTransport({
                SES: { ses: this.ses, aws },
            });
            const from = this.from;
            // Convertir los nombres de los archivos a objetos de adjuntos
            const attachmentsData = await Promise.all(attachments.map(async (filename) => ({
                filename,
                content: await fs.readFileSync(`${this.path}/uploads/${filename}`)
            })));
            // send email to client
            const email = await transporter.sendMail({
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
        }
        catch (error) {
            console.error(`Email sending failed: ${error.message}`);
        }
    }
}
exports.EmailService = EmailService;
