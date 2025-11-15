import { addDays, isAfter } from "date-fns"
import { CheckAddendumProjectsUseCase } from "@/use-cases/technological-services/check-addendum-projects/check-addendum-projects.use-case"
import { NodemailerEmailService } from "@/services/email-service/implementations/nodemailer-email-service"
import { HandlebarsHtmlCompiler } from "@/services/email-service/implementations/handlebars-html-compiler"
import { SendAddendumEmailUseCase } from "@/use-cases/technological-services/send-addendum-email/send-addendum-email.use-case"
import { ProjectsService } from "@/services/projects.service"

async function main() {
  const projectsService = new ProjectsService()
  const checkOverdueProjectsUseCase = new CheckAddendumProjectsUseCase(
    projectsService
  )
  const emailService = new NodemailerEmailService()
  const htmlCompiler = new HandlebarsHtmlCompiler()
  const sendAddendumEmailUseCase = new SendAddendumEmailUseCase(
    emailService,
    htmlCompiler
  )

  const allCards =
    await checkOverdueProjectsUseCase.getGroupedTasksFromProject()

  for (const card of allCards) {
    try {
      const status =
        checkOverdueProjectsUseCase.getSingleSelectValue(card, "Status") ??
        "Sem status"

      // só interessa quando está em andamento
      if (status !== "Em Andamento 🔄") continue

      // pega a data de término
      const endDateStr = checkOverdueProjectsUseCase.getDateValue(
        card,
        "📅 Término"
      )
      if (!endDateStr) continue

      const endDate = new Date(endDateStr)

      // regra: se hoje + 30 dias > data de término
      if (isAfter(addDays(new Date(), 30), endDate)) {
        console.log(
          `🔔 Movendo "${card.content?.title}" para "A Vencer" - término em ${endDateStr}`
        )

        try {
          await checkOverdueProjectsUseCase.updateStatusOfItem(
            card.id,
            "A Vencer"
          )
          console.log(` Card ${card.id} atualizado para "A Vencer".`)
        } catch (err) {
          console.error(`Falha ao atualizar status do card ${card.id}:`, err)
        }

        const projectName = card.content?.title ?? "Projeto sem título"
        const coordinatorName =
          checkOverdueProjectsUseCase.getTextValue(card, "👤 Coordenador") ??
          "Coordenador"
        const companyName =
          checkOverdueProjectsUseCase.getTextValue(card, "🏛️ Empresa") ??
          "Empresa"
          
        let rawEmails =
          checkOverdueProjectsUseCase.getTextValue(card, "✉️ E-mail") ?? ""

        // 2. Quebra por vírgula, ponto e vírgula ou quebra de linha
        const emails = rawEmails
          .split(/[,;\n]/)
          .map((e) => e.trim()) // remove espaços
          .filter((e) => e.length > 0) // descarta itens vazios

        await sendAddendumEmailUseCase.execute({
          to: emails,
          projectName,
          coordinatorName,
          companyName,
        })
      }
    } catch (err) {
      console.error(`Erro inesperado no processamento do card ${card.id}:`, err)
    }
  }
}

main().catch((e) => {
  console.error("Erro fatal ao executar o script:", e)
  process.exit(1) // marca job como falho no GitHub Actions
})