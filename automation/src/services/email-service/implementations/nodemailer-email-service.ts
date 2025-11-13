import nodemailer, { Transporter } from "nodemailer"
import { EmailsService } from "../emails-service" 
import { Email } from "@/entities/email" 
import dotenv from "dotenv"

dotenv.config()

export class NodemailerEmailService implements EmailsService {
  private transporter: Transporter
  private readonly ccAddress = "augusto.oliveira@upe.br"

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async send(email: Email): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.DEFAULT_EMAIL_FROM,
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
      cc: [this.ccAddress],
    })
  }
}
