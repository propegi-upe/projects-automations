import { Email } from "@/entities/email"
import { EmailsService } from "@/services/email-service/emails-service"
import { HtmlCompiler } from "@/services/email-service/html-compiler"

import path from "path"

export interface SendCompletedEmailRequest {
  to: string[]
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

    const email = Email.create({ to, subject, html })
    await this.emailsService.send(email)
  }
}
