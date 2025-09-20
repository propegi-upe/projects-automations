import { Email } from "@/entities/email"
import { EmailsService } from "@/services/email-service/emails-service"
import { HtmlCompiler } from "@/services/email-service/html-compiler"

import path from "path"

export interface SendCheckOverdueEmailRequest {
  to: string[]
  cc: string[]
  projectName: string
  delayedProject: string
  message: string
  remetenteNome: string
  remetenteCargo: string
  linkQuadro: string
}

export class SendCheckOverdueEmailUseCase {
  constructor(
    private emailsService: EmailsService,
    private htmlCompiler: HtmlCompiler<SendCheckOverdueEmailRequest>
  ) {}

  async execute({
    to,
    cc,
    projectName,
    delayedProject,
    message,
    remetenteNome,
    remetenteCargo,
    linkQuadro
  }: SendCheckOverdueEmailRequest) {
    const templatePath = path.resolve("src/views/templates/overdue-columns.hbs")

    const html = await this.htmlCompiler.generateHtml({
      object: { projectName, delayedProject, message, remetenteNome, remetenteCargo, to, cc, linkQuadro },
      templatePath,
    })

    const subject = `${delayedProject} - ${projectName}`

    const email = Email.create({ to, cc, subject, html })
    await this.emailsService.send(email)
  }
}
