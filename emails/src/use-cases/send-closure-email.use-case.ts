import { EmailsService } from "@/services/emails-service" 
import { Email } from "@/entities/email" 

interface SendClosureEmailRequest {
  to: string
  projectName: string
  companyName: string
  professorName: string
}

export class SendClosureEmailUseCase {
  constructor(private emailsService: EmailsService) {}

  async execute({
    to,
    projectName,
    companyName,
    professorName,
  }: SendClosureEmailRequest) {
    const { subject, html } = this.generateClosureEmail({
      projectName,
      companyName,
      professorName,
    })

    const email = Email.create({ to, subject, html })
    await this.emailsService.send(email)
  }

  private generateClosureEmail({
    projectName,
    companyName,
    professorName,
  }: {
    projectName: string
    companyName: string
    professorName: string
  }) {
    const subject = `✅ [Projeto Finalizado] Solicitação de Informações Finais - ${projectName}`

    const html = `
        <p>Prezado prof. <strong>${professorName}</strong>,</p>

        <p>Informamos que o projeto <strong>${projectName}</strong>, desenvolvido em parceria com a empresa <strong>${companyName}</strong> e sob sua coordenação, foi concluído com sucesso 🎉.</p>

        <p>Com o objetivo de aprimorar a gestão e o acompanhamento dos projetos, solicitamos a gentileza que:</p>
        <ol>
        <li>📝 Preencha o formulário de encerramento, disponível em <a href="#">clique aqui</a> (⏱️ Tempo estimado: 1 minuto);</li>
        <li>📄 Envie o relatório de finalização do projeto no formato .pdf em resposta a este e-mail.</li>
        </ol>

        <p>🔁 Sua colaboração é essencial para fortalecermos as iniciativas de desenvolvimento tecnológico.</p>

        <p>📞💬 Ficamos à disposição para quaisquer dúvidas.</p>

        <p>Atenciosamente,<br/>
        Gerência de Projetos e Serviços Tecnológicos<br/>
        Pró-Reitoria de Pós-Graduação, Pesquisa e Inovação da Universidade de Pernambuco</p>
    `

    return { subject, html }
  }
}
