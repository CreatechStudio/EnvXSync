import nodemailer from "nodemailer";
import {
    SMTP_FROM,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USER,
} from "../index";

export class Mailer {
    async sendMail(to: string, subject: string, html: string) {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: true,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASSWORD,
            },
        });
        const mailOptions: any = {
            from: SMTP_FROM || SMTP_USER,
            to,
            subject,
        };
        mailOptions.html = html;
        return await transporter.sendMail(mailOptions);
    }
}
