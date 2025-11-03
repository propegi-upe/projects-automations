import { Email } from "@/entities/email"
import { EmailsService } from "@/services/email-service/emails-service"
import { HtmlCompiler } from "@/services/email-service/html-compiler"
import path from "path"

// Defina uma interface genérica para os dados de entrada
export interface BaseEmailRequest {
  to?: string[]
  cc?: string[] // Incluído para ser mais genérico
  // Quaisquer outras propriedades comuns, se houver
}

// Interface para os dados do fallback, que mudam minimamente
export interface FallbackData {
  projectName: string
  [key: string]: string | undefined
}

export abstract class EmailSenderBaseUseCase<T extends BaseEmailRequest> {
  // O constructor e os serviços são injetados aqui
  constructor(
    protected emailsService: EmailsService,
    protected htmlCompiler: HtmlCompiler<T>
  ) {}

  // Métodos abstratos que cada Use Case filho deve implementar
  protected abstract getSubject(request: T): string
  protected abstract getTemplatePath(): string
  protected abstract getFallbackData(
    request: T,
    reasonError: string
  ): {
    data: FallbackData // Dados específicos para a mensagem de fallback
    subject: string // Assunto específico do fallback
    to: string[] // Destinatários do fallback (o hardcoded "ejsilva159@gmail.com")
  }

  // --- Lógica Comum: Validação, Envio e Fallback ---

  isValidEmail(email: string): boolean {
    // 1. Verifica se a string não está vazia ou é apenas espaço em branco
    if (!email || email.trim().length === 0) {
      return false
    }

    // 2. Aplica a regex
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email.trim())
  }

  protected async sendFallbackToCC({
    data,
    subject,
    to,
  }: {
    data: FallbackData
    subject: string
    to: string[]
  }): Promise<void> {
    const reasonError = data.reasonError ? `\n${data.reasonError}` : ""

    // Constrói o corpo do texto do fallback
    const bodyText = Object.entries(data)
      .filter(([key]) => key !== "reasonError")
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n")

    const text = `Não foi possível enviar para os destinatários principais/primários. Notificando apenas o CC.
      ${bodyText}
      ${reasonError}`

    const fallbackEmail = Email.create({ to, subject, text })
    await this.emailsService.send(fallbackEmail)
    console.warn(`Fallback enviado somente para CC: ${to.join(", ")}`)
  }

  // Método principal que coordena a lógica
  async execute(request: T): Promise<void> {
    const { to } = request
    const templatePath = path.resolve(this.getTemplatePath())

    const html = await this.htmlCompiler.generateHtml({
      object: request as any, // TypeScript pode precisar de 'as any' aqui
      templatePath,
    })

    const subject = this.getSubject(request)

    try {
      const allToAreValid =
        to && to.length > 0 && to.every((email) => this.isValidEmail(email))

      if (allToAreValid) {
        const email = Email.create({ to, cc: request.cc, subject, html })
        await this.emailsService.send(email)
        console.log(`Notificação enviada para ${to!.join(", ")}`)
        return
      }

      const reasonError = "Motivo: E-mail vazio ou inválido"
      const fallbackData = this.getFallbackData(request, reasonError)
      this.sendFallbackToCC(fallbackData)
    } catch (error) {
      // Caso de erro inesperado no envio
      console.error(`Erro no envio do e-mail: ${error}`)
      const reasonError = "Motivo: erro inesperado no envio"
      const fallbackData = this.getFallbackData(request, reasonError)
      this.sendFallbackToCC(fallbackData)
    }
  }
}