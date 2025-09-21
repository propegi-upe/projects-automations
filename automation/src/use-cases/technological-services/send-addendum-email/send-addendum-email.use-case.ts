import { Email } from "@/entities/email"

import { HtmlCompiler } from "@/services/email-service/html-compiler"

import { EmailsService } from "@/services/email-service/emails-service"

import path from "path"

export interface SendAddendumEmailRequest {
  to?: string[]
  projectName: string
  coordinatorName: string
  companyName: string
}

export class SendAddendumEmailUseCase {
  constructor(
    private emailsService: EmailsService,
    private htmlCompiler: HtmlCompiler<SendAddendumEmailRequest>
  ) {}

  async execute({
    to,
    projectName,
    coordinatorName,
    companyName,
  }: SendAddendumEmailRequest) {
    const templatePath = path.resolve("src/views/templates/addendum-email.hbs")

    const html = await this.htmlCompiler.generateHtml({
      object: { projectName, coordinatorName, companyName, to },
      templatePath,
    })

    const subject = `🔔 [Projeto a Vencer] ${projectName} - Aditivo de Prorrogação de Prazo`

    try {
      if (to && to.length > 0 && this.isValidEmail(to[0])) {
        const email = Email.create({ to, subject, html })
        await this.emailsService.send(email)
        console.log(`✅ Notificação enviada para ${to}`)
        return
      }

      console.warn(
        `⚠️ Não foi possível enviar: projeto "${projectName}" sem campo "✉️ E-mail"`
      )
      const reasonError = "Motivo: E-mail vazio ou inválido"
      this.sendFallbackToCC({
        projectName,
        companyName,
        coordinatorName,
        reasonError,
      })
    } catch (error) {
      console.warn(`Não foi possível enviar: ${error}`)
      const reasonError = "Motivo: erro inesperado"
      this.sendFallbackToCC({
        projectName,
        companyName,
        coordinatorName,
        reasonError,
      })
    }
  }

  async sendFallbackToCC(data: {
    projectName: string
    companyName: string
    coordinatorName: string
    reasonError?: string
  }): Promise<void> {
    const fallbackEmail = Email.create({
      to: ["ejsilva159@gmail.com"],
      subject: `[FALLBACK] E-mail de aditivo ${data.projectName}`,
      text: `Não foi possível enviar para o coordenador. Notificando apenas o CC.
      Projeto: ${data.projectName}
      Empresa: ${data.companyName}
      Coordenador: ${data.coordinatorName}
      ${data.reasonError}`,
    })

    await this.emailsService.send(fallbackEmail)
    console.warn(`📩 Fallback enviado somente para CC`)
  }

  isValidEmail(email: string): boolean {
    // regex simples: algo@algo.dominio
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }
}
