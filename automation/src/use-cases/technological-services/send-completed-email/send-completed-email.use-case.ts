import {
  EmailSenderBaseUseCase,
  BaseEmailRequest,
} from "./../../email/email-sender-base-usecase"

import { EmailsService } from "@/services/email-service/emails-service"
import { HtmlCompiler } from "@/services/email-service/html-compiler"

export interface SendCompletedEmailRequest extends BaseEmailRequest {
  projectName: string
  companyName: string
  professorName: string
}

export class SendCompletedEmailUseCase extends EmailSenderBaseUseCase<SendCompletedEmailRequest> {
  // O constructor simplesmente chama o super
  constructor(
    emailsService: EmailsService,
    htmlCompiler: HtmlCompiler<SendCompletedEmailRequest>
  ) {
    super(emailsService, htmlCompiler)
  }

  // 1. Implementação do Assunto Específico
  protected getSubject(request: SendCompletedEmailRequest): string {
    return `✅ [Projeto Finalizado] Solicitação de Informações Finais - ${request.projectName}`
  }

  // 2. Implementação do Template Path Específico
  protected getTemplatePath(): string {
    return "src/views/templates/completed-email.hbs"
  }

  // 3. Implementação dos Dados de Fallback Específicos
  protected getFallbackData(
    request: SendCompletedEmailRequest,
    reasonError: string
  ) {
    return {
      to: ["ejsilva159@gmail.com"], // Fallback hardcoded
      subject: `[FALLBACK] Encerramento do projeto ${request.projectName}`,
      data: {
        projectName: request.projectName,
        companyName: request.companyName,
        professorName: request.professorName,
        reasonError,
      },
    }
  }

  // O método 'execute' é herdado e executa a lógica completa!
}
