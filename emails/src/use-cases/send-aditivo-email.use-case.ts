import { EmailsService } from "@/services/emails-service" 
import { Email } from "@/entities/email" 

interface SendAditivoEmailRequest {
  to: string
  nomeProjeto: string
  nomeCoordenador: string
  nomeEmpresa: string
}

export class SendAditivoEmailUseCase {
  constructor(private emailsService: EmailsService) {}

  async execute({to, nomeProjeto, nomeCoordenador, nomeEmpresa}: SendAditivoEmailRequest) {
    const { subject, html } = this.gerarEmailAditivo({nomeProjeto, nomeCoordenador, nomeEmpresa})
    const email = Email.create({ to, subject, html })
    await this.emailsService.send(email)
  }

  gerarEmailAditivo({
    nomeProjeto,
    nomeCoordenador,
    nomeEmpresa,
    }: {
    nomeProjeto: string
    nomeCoordenador: string
    nomeEmpresa: string
    }) {
    const subject = `🔔 [Projeto a Vencer] ${nomeProjeto} - Aditivo de Prorrogação de Prazo`

    const html = `
        <p>Prezado(a) ${nomeCoordenador},</p>

        <p>Informamos que o projeto <strong>${nomeProjeto}</strong>, desenvolvido em parceria com a empresa <strong>${nomeEmpresa}</strong> e sob sua coordenação, está próximo do vencimento, conforme o cronograma estabelecido.</p>

        <p>Gostaríamos de saber se há interesse em realizar um <strong>aditivo de prorrogação de prazo 📄🖊️</strong>.</p>

        <p>✅ <strong>Caso haja interesse</strong>, solicitamos a gentileza de nos enviar os <strong>formulários em anexo</strong> devidamente preenchidos.</p>

        <p>❌ <strong>Caso não haja interesse</strong>, pedimos que responda com a seguinte mensagem: <em>"Não tenho interesse."</em></p>

        <p>📞💬 Ficamos à disposição para quaisquer dúvidas ou esclarecimentos.</p>

        <p>Atenciosamente,<br/>
        Assistente de Projetos<br/>
        Coordenação de Desenvolvimento Tecnológico</p>
    `

    return { subject, html }
    }
}
