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
      if (to && to.length > 0 && to[0].trim() !== "") {
        const email = Email.create({ to, subject, html })
        await this.emailsService.send(email)
        console.log(`✅ Notificação enviada para ${to}`)
        return
      }

      console.warn(
        `⚠️ Não foi possível enviar: projeto "${projectName}" sem campo "✉️ E-mail"`
      )
      this.sendFallbackToCC({ projectName, companyName, professorName })
    } catch (error) {
      this.sendFallbackToCC({ projectName, companyName, professorName })
    }
  }

  async sendFallbackToCC(data: {
    projectName: string
    companyName: string
    professorName: string
  }): Promise<void> {
    const fallbackEmail = Email.create({
      to: ["ejsilva159@gmail.com"],
      subject: `[FALLBACK] Encerramento do projeto ${data.projectName}`,
      text: `Não foi possível enviar para o professor/coordenador. Notificando apenas o CC.
      Projeto: ${data.projectName}
      Empresa: ${data.companyName}
      Coordenador: ${data.professorName}`,
    })

    await this.emailsService.send(fallbackEmail)
    console.warn(`📩 Fallback enviado somente para CC`)
  }
}
