import { addDays, isAfter } from "date-fns"
import { CheckOverdueProjectsUseCase } from "@/use-cases/check-overdue-projects/check-overdue-projects.use-case"
import { NodemailerEmailService } from "@/services/email-service/implementations/nodemailer-email-service"
import { HandlebarsHtmlCompiler } from "@/services/email-service/implementations/handlebars-html-compiler"
import { SendAddendumEmailUseCase } from "@/use-cases/send-addendum-email.use-case"

const BOARD_ID = "PVT_kwDODE36584A64ML" 

async function main() {
  const checkOverdueProjectsUseCase = new CheckOverdueProjectsUseCase()
  const emailService = new NodemailerEmailService()
  const htmlCompiler = new HandlebarsHtmlCompiler()
  const sendAddendumEmailUseCase = new SendAddendumEmailUseCase(
    emailService,
    htmlCompiler
  )

  const allCards = await checkOverdueProjectsUseCase.getGroupedTasksFromProject(BOARD_ID)

  for (const card of allCards) {
    const status = checkOverdueProjectsUseCase.getSingleSelectValue(card, "Status") ?? "Sem status"

    // só interessa quando está em andamento
    if (status !== "Em Andamento") continue

    // pega a data de término
    const endDateStr = checkOverdueProjectsUseCase.getDateValue(card, "Término")
    if (!endDateStr) continue

    const endDate = new Date(endDateStr)

    // regra: se hoje + 30 dias > data de término
    if (isAfter(addDays(new Date(), 30), endDate)) {
      console.log(`Movendo "${card.content?.title}" para "A Vencer" - término em ${endDateStr}`)

      await checkOverdueProjectsUseCase.updateStatusOfItem(card.id, "A Vencer")

      const projectName = card.content?.title ?? "Projeto sem título"
      const coordinatorName =
        checkOverdueProjectsUseCase.getTextValue(card, "👤 Coordenador") ?? "Coordenador"
      const companyName =
        checkOverdueProjectsUseCase.getTextValue(card, "🏛️ Empresa") ?? "Empresa"
      const emailDestino =
        checkOverdueProjectsUseCase.getTextValue(card, "✉️ E-mail")

      if (emailDestino) {
        await sendAddendumEmailUseCase.execute({
          to: emailDestino,
          projectName,
          coordinatorName,
          companyName,
        })
        console.log(`Notificação de aditivo enviada para ${emailDestino}`)
      } else {
        console.warn(`Não foi possível enviar e-mail para ${projectName}, sem campo "Email Coordenador"`)
      }
    }
  }
}

main().catch((e) => {
  console.error("Erro ao executar o script:", e)
})
