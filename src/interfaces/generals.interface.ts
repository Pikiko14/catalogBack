export interface PdfActions {
    type: string;
    data: any;
}

export interface EmailData {
    email: string;
    attachments?: string[];
    subject: string;
    text?: string;
}
