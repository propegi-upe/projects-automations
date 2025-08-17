import { NodemailerEmailService } from "@/services/email-service/implementations/nodemailer-email-service"
import { HandlebarsHtmlCompiler } from "@/services/email-service/implementations/handlebars-html-compiler"
import { SendClosureEmailUseCase } from "@/use-cases/send-closure-email.use-case"

import { CheckCompletedProjectsUseCase } from "@/use-cases/check-completed-projects/check-completed-projects.use-case"

const BOARD_ID = "PVT_kwDODE36584A64ML" 

async function main() {
  const checkCompletedProjectsUseCase = new CheckCompletedProjectsUseCase()
  const emailService = new NodemailerEmailService()
  const htmlCompiler = new HandlebarsHtmlCompiler()
  const sendClosureEmailUseCase = new SendClosureEmailUseCase(
    emailService,
    htmlCompiler
  )

  const allCards = await checkCompletedProjectsUseCase.getGroupedTasksFromProject(BOARD_ID)

  for (const card of allCards) {
    const status = checkCompletedProjectsUseCase.getSingleSelectValue(card, "Status") ?? "Sem status"

    if (status !== "Finalizado ✅") continue

    const notificado = checkCompletedProjectsUseCase.getSingleSelectValue(card, "Notificado");

    if (!notificado || notificado === "false") {
      console.log(`Projeto ${card.content?.title} ainda não notificado.`)

      const projectName = card.content?.title ?? "Projeto sem título"

      const companyName =
        checkCompletedProjectsUseCase.getTextValue(card, "🏛️ Empresa") ??
        "Empresa"

      const professorName =
        checkCompletedProjectsUseCase.getTextValue(card, "👤 Coordenador") ??
        "Coordenador"

      const emailDestino = checkCompletedProjectsUseCase.getTextValue(
        card,
        "✉️ E-mail"
      )

      if (emailDestino) {
        await sendClosureEmailUseCase.execute({
          to: emailDestino,
          projectName,
          companyName,
          professorName,
        })
        console.log(`Notificação de encerramento enviada para ${emailDestino}`)
      } else {
        console.warn(
          `Não foi possível enviar e-mail para ${projectName}, sem campo "✉️ E-mail"`
        )
      }

      // Atualiza o campo "Notificado" para true
      await checkCompletedProjectsUseCase.updateCardField(card.id)
    } 
  }
}

main().catch((e) => {
  console.error("Erro ao executar o script:", e)
})
