import {
  EmailSenderBaseUseCase,
  BaseEmailRequest,
} from "./../../email/email-sender-base-usecase"
// src/use-cases/email/send-check-overdue-email-usecase.ts

import { EmailsService } from "@/services/email-service/emails-service"
import { HtmlCompiler } from "@/services/email-service/html-compiler"

// Estende a BaseEmailRequest para incluir os campos específicos
export interface SendCheckOverdueEmailRequest extends BaseEmailRequest {
  projectName: string
  delayedProject: string
  message: string
  remetenteNome: string
  remetenteCargo: string
  linkQuadro: string
  // O 'to' e 'cc' já estão em BaseEmailRequest
}

// Estende a classe base e especifica o tipo de Request
export class SendCheckOverdueEmailUseCase extends EmailSenderBaseUseCase<SendCheckOverdueEmailRequest> {
  // O constructor simplesmente chama o super com as injeções de dependência
  constructor(
    emailsService: EmailsService,
    htmlCompiler: HtmlCompiler<SendCheckOverdueEmailRequest>
  ) {
    super(emailsService, htmlCompiler)
  }

  // 1. Implementação do Assunto Específico
  protected getSubject(request: SendCheckOverdueEmailRequest): string {
    return `${request.delayedProject} - ${request.projectName}`
  }

  // 2. Implementação do Template Path Específico
  protected getTemplatePath(): string {
    return "src/views/templates/overdue-columns.hbs"
  }

  // 3. Implementação dos Dados de Fallback Específicos
  protected getFallbackData(
    request: SendCheckOverdueEmailRequest,
    reasonError: string
  ) {
    // CORREÇÃO: Usar a chave 'projectName' para satisfazer FallbackData
    const fallbackSpecificData = {
      // A chave precisa ser 'projectName' para satisfazer a interface da classe base
      projectName: request.projectName,
      "Etapa em atraso": request.delayedProject,
      "Responsável (Nome)": request.remetenteNome,
      "Responsável (Cargo)": request.remetenteCargo,
      reasonError,
    }

    return {
      to: ["ejsilva159@gmail.com"],
      subject: `[FALLBACK] ${request.delayedProject} - ${request.projectName}`,
      data: fallbackSpecificData,
    }
  }

  // OBS: O método 'execute' e toda a lógica de envio/fallback
  // são herdados e executados pela classe base!
}
