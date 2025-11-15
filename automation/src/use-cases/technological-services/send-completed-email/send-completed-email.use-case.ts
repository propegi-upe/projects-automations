import { Email } from "@/entities/email"
import { EmailsService } from "@/services/email-service/emails-service"
import { HtmlCompiler } from "@/services/email-service/html-compiler"

import path from "path"

export interface SendCompletedEmailRequest {
  to?: string[]
  projectName: string
  companyName: string
  professorName: string
}

export class SendCompletedEmailUseCase {
  constructor(
    private emailsService: EmailsService,
    private htmlCompiler: HtmlCompiler<SendCompletedEmailRequest>
  ) {}

  async execute({
    to,
    projectName,
    companyName,
    professorName,
  }: SendCompletedEmailRequest) {
    const templatePath = path.resolve("src/views/templates/completed-email.hbs")

    const html = await this.htmlCompiler.generateHtml({
      object: { projectName, companyName, professorName, to },
      templatePath,
    })

    const subject = `✅ [Projeto Finalizado] Solicitação de Informações Finais - ${projectName}`

    try {
       if (to && to.length > 0) {
         const validEmails = to.filter((e) => this.isValidEmail(e))

         if (validEmails.length > 0) {
           const email = Email.create({
             to: validEmails,
             subject,
             html,
           })
           await this.emailsService.send(email)
           console.log(`Notificação enviada para: ${validEmails.join(", ")}`)
           return
         }
       }

      console.warn(
        `Não foi possível enviar: projeto "${projectName}" sem campo "✉️ E-mail"`
      )
      const reasonError = "Motivo: E-mail vazio ou inválido"
      this.sendFallbackToCC({
        projectName,
        companyName,
        professorName,
        reasonError,
      })
    } catch (error) {
      const reasonError = "Motivo: erro inesperado"
      this.sendFallbackToCC({
        projectName,
        companyName,
        professorName,
        reasonError,
      })
    }
  }

  async sendFallbackToCC(data: {
    projectName: string
    companyName: string
    professorName: string
    reasonError?: string
  }): Promise<void> {
    const fallbackEmail = Email.create({
      to: ["augusto.oliveira@upe.br"],
      subject: `[FALLBACK] Encerramento do projeto ${data.projectName}`,
      text: `Não foi possível enviar para o professor. Notificando apenas o CC.
      Projeto: ${data.projectName}
      Empresa: ${data.companyName}
      Professor: ${data.professorName}
      ${data.reasonError}`,
    })

    await this.emailsService.send(fallbackEmail)
    console.warn(`Fallback enviado somente para CC`)
  }

  isValidEmail(email: string): boolean {
    // regex simples: algo@algo.dominio
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }
}
