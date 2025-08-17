import { Email } from "@/entities/email"

import { HtmlCompiler } from "@/services/email-service/html-compiler"

import { EmailsService } from "@/services/email-service/emails-service"

import path from "path"

export interface SendAddendumEmailRequest {
  to: string
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

    const email = Email.create({ to, subject, html })
    await this.emailsService.send(email)
  }
}
