import { EmailsService } from "@/services/emails-service" 
import { Email } from "@/entities/email" 

interface SendAddendumEmailRequest {
  to: string
  projectName: string
  coordinatorName: string
  companyName: string
}

export class SendAddendumEmailUseCase {
  constructor(private emailsService: EmailsService) {}

  async execute({
    to,
    projectName,
    coordinatorName,
    companyName,
  }: SendAddendumEmailRequest) {
    const { subject, html } = this.generateAddendumEmail({
      projectName,
      coordinatorName,
      companyName,
    })

    const email = Email.create({ to, subject, html })
    await this.emailsService.send(email)
  }

  private generateAddendumEmail({
    projectName,
    coordinatorName,
    companyName,
  }: {
    projectName: string
    coordinatorName: string
    companyName: string
  }) {
    const subject = `🔔 [Projeto a Vencer] ${projectName} - Aditivo de Prorrogação de Prazo`

    const html = `
        <p>Prezado(a) ${coordinatorName},</p>

        <p>Informamos que o projeto <strong>${projectName}</strong>, desenvolvido em parceria com a empresa <strong>${companyName}</strong> e sob sua coordenação, está próximo do vencimento, conforme o cronograma estabelecido.</p>

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
