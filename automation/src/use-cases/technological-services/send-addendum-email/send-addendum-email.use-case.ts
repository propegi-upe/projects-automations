import {
  EmailSenderBaseUseCase,
  BaseEmailRequest,
  FallbackData,
} from "./../../email/email-sender-base-usecase"

import { EmailsService } from "@/services/email-service/emails-service"
import { HtmlCompiler } from "@/services/email-service/html-compiler"

// Estende a BaseEmailRequest para incluir os campos específicos
export interface SendAddendumEmailRequest extends BaseEmailRequest {
  projectName: string
  coordinatorName: string
  companyName: string
}

// Estende a classe base e especifica o tipo de Request
export class SendAddendumEmailUseCase extends EmailSenderBaseUseCase<SendAddendumEmailRequest> {
  // O constructor simplesmente chama o super com as injeções de dependência
  constructor(
    emailsService: EmailsService,
    htmlCompiler: HtmlCompiler<SendAddendumEmailRequest>
  ) {
    super(emailsService, htmlCompiler)
  }

  // 1. Implementação do Assunto Específico
  protected getSubject(request: SendAddendumEmailRequest): string {
    return `🔔 [Projeto a Vencer] ${request.projectName} - Aditivo de Prorrogação de Prazo`
  }

  // 2. Implementação do Template Path Específico
  protected getTemplatePath(): string {
    return "src/views/templates/addendum-email.hbs"
  }

  // 3. Implementação dos Dados de Fallback Específicos
  protected getFallbackData(
    request: SendAddendumEmailRequest,
    reasonError: string
  ) {
    // Definimos os dados específicos que aparecerão no corpo do fallback
    const fallbackSpecificData: FallbackData = {
      // 'projectName' é obrigatório pela interface FallbackData
      projectName: request.projectName,
      Empresa: request.companyName,
      Coordenador: request.coordinatorName,
      reasonError,
    }

    return {
      to: ["augusto.oliveira@upe.br"], // Fallback hardcoded
      subject: `[FALLBACK] E-mail de aditivo ${request.projectName}`,
      data: fallbackSpecificData,
    }
  }

  // OBS: O método 'execute' e toda a lógica de envio/fallback
  // são herdados e executados pela classe base!
}
