import nodemailer from 'nodemailer'

const trasnporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
})

export class MailService {
    static async send(to: string, title: string, body: string   ){
        await trasnporter.sendMail({
            from: `Yu-Gi-Oh! App <${process.env.GMAIL_USER}>`,
            to,
            subject: title,
            html: body
        })
    }
}