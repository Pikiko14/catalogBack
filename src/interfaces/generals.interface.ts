import { ProfileInterface } from "./profile.interface";

export interface PdfActions {
    type: string;
    data: any;
}

export interface EmailData {
    profile?: ProfileInterface;
    email: string;
    attachments?: string[];
    subject: string;
    text?: string;
}
