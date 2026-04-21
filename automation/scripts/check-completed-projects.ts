import { NodemailerEmailService } from "@/services/email-service/implementations/nodemailer-email-service"
import { HandlebarsHtmlCompiler } from "@/services/email-service/implementations/handlebars-html-compiler"
import { SendCompletedEmailUseCase } from "@/use-cases/technological-services/send-completed-email/send-completed-email.use-case"

import { CheckCompletedProjectsUseCase } from "@/use-cases/technological-services/check-completed-projects/check-completed-projects.use-case"
import { ProjectsService } from "@/services/projects.service"

async function main() {
  const projectsService = new ProjectsService()
  const checkCompletedProjectsUseCase = new CheckCompletedProjectsUseCase(
    projectsService
  )
  const emailService = new NodemailerEmailService()
  const htmlCompiler = new HandlebarsHtmlCompiler()
  const sendCompletedEmailUseCase = new SendCompletedEmailUseCase(
    emailService,
    htmlCompiler
  )

  const allCards =
    await checkCompletedProjectsUseCase.getGroupedTasksFromProject()

  for (const card of allCards) {
    try {
      const status =
        checkCompletedProjectsUseCase.getSingleSelectValue(card, "Status") ??
        "Sem status"

      if (status !== "✅ Finalizado") continue

      const notificado = checkCompletedProjectsUseCase.getSingleSelectValue(
        card,
        "Notificado finalização"
      )

      const terminoRaw =
        checkCompletedProjectsUseCase.getDateValue(card, "📅 Término") ?? ""

      console.log("Data")
      console.log(terminoRaw)

      const terminoDate = new Date(terminoRaw)
      const today = new Date()

      const isSameDay =
      terminoDate.getFullYear() === today.getFullYear() &&
      terminoDate.getMonth() === today.getMonth() &&
      terminoDate.getDate() === today.getDate()

      if ((!notificado || notificado === "false") && isSameDay) {
        console.log("Entrou aqui")
        console.log(`🔔 Projeto "${card.content?.title}" ainda não notificado.`)

        const projectName = card.content?.title ?? "Projeto sem título"
        const companyName =
          checkCompletedProjectsUseCase.getTextValue(card, "🏛️ Empresa") ??
          "Empresa"
        const professorName =
          checkCompletedProjectsUseCase.getTextValue(card, "👤 Coordenador") ??
          "Coordenador"

        // 1. Recupera campo
        let rawEmails =
          checkCompletedProjectsUseCase.getTextValue(card, "✉️ E-mail") ?? ""

        // 2. Quebra por vírgula, ponto e vírgula ou quebra de linha
        const emails = rawEmails
          .split(/[,;\n]/)
          .map((e) => e.trim()) // remove espaços
          .filter((e) => e.length > 0) // descarta itens vazios

        await sendCompletedEmailUseCase.execute({
          to: emails,
          projectName,
          companyName,
          professorName,
        })

        // Marca card como notificado, mesmo que tenha ido só pro CC
        try {
          await checkCompletedProjectsUseCase.updateCardField(card.id)
          console.log(`Card ${card.id} marcado como notificado.`)
        } catch (err) {
          console.error(
            `Falha ao atualizar campo Notificado do card ${card.id}:`,
            err
          )
        }
      }
    } catch (err) {
      console.error(`Erro inesperado no processamento do card ${card.id}:`, err)
    }
  }
}

main().catch((e) => {
  console.error("Erro fatal ao executar o script:", e)
  process.exit(1) // garante status de erro no GitHub Actions
})
