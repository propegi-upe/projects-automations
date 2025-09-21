import { Email } from "@/entities/email"
import { EmailsService } from "@/services/email-service/emails-service"
import { HtmlCompiler } from "@/services/email-service/html-compiler"

import path from "path"

export interface SendCheckOverdueEmailRequest {
  to?: string[]
  cc?: string[]
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
    linkQuadro,
  }: SendCheckOverdueEmailRequest) {
    const templatePath = path.resolve("src/views/templates/overdue-columns.hbs")

    const html = await this.htmlCompiler.generateHtml({
      object: {
        projectName,
        delayedProject,
        message,
        remetenteNome,
        remetenteCargo,
        to,
        cc,
        linkQuadro,
      },
      templatePath,
    })

    const subject = `${delayedProject} - ${projectName}`

    try {
      if (to && to.length > 0 && this.isValidEmail(to[0])) {
        const email = Email.create({ to, cc, subject, html })
        await this.emailsService.send(email)
        console.log(`Notificação de atraso enviada para ${to}`)
        return
      }

      console.warn(
        `Não foi possível enviar: projeto "${projectName}" sem campo "✉️ E-mail"`
      )
      const reasonError = "Motivo: E-mail vazio ou inválido"
      this.sendFallbackToCC({
        projectName,
        delayedProject,
        remetenteNome,
        remetenteCargo,
        reasonError,
      })
    } catch (error) {
      const reasonError = "Motivo: erro inesperado no envio"
      this.sendFallbackToCC({
        projectName,
        delayedProject,
        remetenteNome,
        remetenteCargo,
        reasonError,
      })
    }
  }

  async sendFallbackToCC(data: {
    projectName: string
    delayedProject: string
    remetenteNome: string
    remetenteCargo: string
    reasonError?: string
  }): Promise<void> {
    const fallbackEmail = Email.create({
      to: ["ejsilva159@gmail.com"],
      subject: `[FALLBACK] ${data.delayedProject} - ${data.projectName}`,
      text: `Não foi possível enviar para os destinatários principais. Notificando apenas o CC.
      Projeto: ${data.projectName}
      Etapa em atraso: ${data.delayedProject}
      Responsável: ${data.remetenteNome} (${data.remetenteCargo})
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
