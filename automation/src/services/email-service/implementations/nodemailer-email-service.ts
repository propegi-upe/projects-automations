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

  /**
   * Envia somente para o CC fixo (fallback)
   */
  async sendFallbackToCC(data: {
    projectName: string
    companyName: string
    professorName: string
  }): Promise<void> {
    const subject = `[FALLBACK] Encerramento do projeto ${data.projectName}`
    const text = `Não foi possível enviar para o professor/coordenador. Notificando apenas o CC.\n\n
    Projeto: ${data.projectName}\n
    Empresa: ${data.companyName}\n
    Coordenador: ${data.professorName}`

    await this.transporter.sendMail({
      from: process.env.DEFAULT_EMAIL_FROM,
      to: this.ccAddress,
      subject,
      text,
    })

    console.warn(`📩 Fallback enviado somente para ${this.ccAddress}`)
  }
}
