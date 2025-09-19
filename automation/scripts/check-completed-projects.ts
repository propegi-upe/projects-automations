import { NodemailerEmailService } from "@/services/email-service/implementations/nodemailer-email-service"
import { HandlebarsHtmlCompiler } from "@/services/email-service/implementations/handlebars-html-compiler"
import { SendClosureEmailUseCase } from "@/use-cases/send-closure-email.use-case"

import { CheckCompletedProjectsUseCase } from "@/use-cases/check-completed-projects/check-completed-projects.use-case"
import { ProjectsService } from "@/services/projects.service"

async function main() {
  const projectsService = new ProjectsService()
  const checkCompletedProjectsUseCase = new CheckCompletedProjectsUseCase(
    projectsService
  )
  const emailService = new NodemailerEmailService()
  const htmlCompiler = new HandlebarsHtmlCompiler()
  const sendClosureEmailUseCase = new SendClosureEmailUseCase(
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

      if (status !== "Finalizado ✅") continue

      const notificado = checkCompletedProjectsUseCase.getSingleSelectValue(
        card,
        "Notificado"
      )

      if (!notificado || notificado === "false") {
        console.log(`🔔 Projeto "${card.content?.title}" ainda não notificado.`)

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

        try {
          if (emailDestino) {
            await sendClosureEmailUseCase.execute({
              to: emailDestino,
              projectName,
              companyName,
              professorName,
            })
            console.log(`Notificação enviada para ${emailDestino}`)
          } else {
            console.warn(
              `Não foi possível enviar e-mail: projeto "${projectName}" sem campo "✉️ E-mail"`
            )
          }
        } catch (err) {
          console.error(
            `Falha ao enviar e-mail para ${emailDestino ?? "(sem email)"}:`,
            err
          )

          // Fallback: notifica sempre o CC, mesmo se o principal falhou
          await emailService.sendFallbackToCC({
            projectName,
            companyName,
            professorName,
          })
        }

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
