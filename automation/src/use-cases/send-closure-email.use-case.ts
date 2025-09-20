import { Email } from "@/entities/email"
import { EmailsService } from "@/services/email-service/emails-service"
import { HtmlCompiler } from "@/services/email-service/html-compiler"

import path from "path"

export interface SendClosureEmailRequest {
  to: string[]
  projectName: string
  companyName: string
  professorName: string
}

export class SendClosureEmailUseCase {
  constructor(
    private emailsService: EmailsService,
    private htmlCompiler: HtmlCompiler<SendClosureEmailRequest>
  ) {}

  async execute({
    to,
    projectName,
    companyName,
    professorName,
  }: SendClosureEmailRequest) {
    const templatePath = path.resolve("src/views/templates/closure-email.hbs")

    const html = await this.htmlCompiler.generateHtml({
      object: { projectName, companyName, professorName, to },
      templatePath,
    })

    const subject = `✅ [Projeto Finalizado] Solicitação de Informações Finais - ${projectName}`

    const email = Email.create({ to, subject, html })
    await this.emailsService.send(email)
  }
}
