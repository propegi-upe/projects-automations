import { ProjectsService } from "@/services/projects.service"
import { CheckOverduePayrollsUseCase } from "@/use-cases/check-overdue-payrolls/check-overdue-payrolls.use-case"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import { SendCheckOverdueEmailUseCase } from "@/use-cases/send-email-check-overdue-columns.use-case"
import { NodemailerEmailService } from "@/services/email-service/implementations/nodemailer-email-service"
import { HandlebarsHtmlCompiler } from "@/services/email-service/implementations/handlebars-html-compiler"

type OverdueRule = {
  currentStatuses: string[]
  dueDateField: string // pega data do card
  fallbackDateCheck?: () => boolean // usado se não houver data
  targetStatus: string
  notify?: {
    to: string[] // destinatários principais
    cc?: string[] // cópias
  }
}

const overdueRules: OverdueRule[] = [
  {
    currentStatuses: ["⏳ Folhas em Preparação"],
    dueDateField: "Data limite para empenho",
    fallbackDateCheck: () => dayjs().date() > 24,
    targetStatus: "Em Atraso de Empenho",
    notify: {
      to: ["ejsilva159@gmail.com", "ejs15@discente.ifpe.edu.br"],
    },
  },
  {
    currentStatuses: ["🔒 Empenhada"],
    dueDateField: "Data limite para liquidação",
    fallbackDateCheck: () => dayjs().date() > 28,
    targetStatus: "Em Atraso de Liquidação",
    notify: {
      to: ["ejsilva159@gmail.com", "ejs15@discente.ifpe.edu.br"],
    },
  },
  {
    currentStatuses: ["🧾 Liquidada"],
    dueDateField: "Data limite de PD",
    fallbackDateCheck: () => dayjs().date() > 2,
    targetStatus: "Em Atraso de PD",
    notify: {
      to: ["ejsilva159@gmail.com", "ejs15@discente.ifpe.edu.br"],
    },
  },
  {
    currentStatuses: ["🗓️ Em PD"],
    dueDateField: "Data limite para OB",
    fallbackDateCheck: () => dayjs().date() > 11,
    targetStatus: "Em Atraso de OB",
    notify: {
      to: ["ejsilva159@gmail.com", "ejs15@discente.ifpe.edu.br"],
    },
  },
]

dayjs.extend(utc)
dayjs.extend(timezone)

// Define o fuso fixo, ex: Brasília
const TIMEZONE = "America/Sao_Paulo"

function isDateOverdue(dateStr: string): boolean {
  return dayjs().tz(TIMEZONE).isAfter(dayjs(dateStr).tz(TIMEZONE), "day")
}

async function main() {
  const projectsService = new ProjectsService()
  const checkOverduePayrollsUseCase = new CheckOverduePayrollsUseCase(
    projectsService
  )

  const allCards =
    await checkOverduePayrollsUseCase.getGroupedTasksFromProject()

  for (const card of allCards) {
    const status =
      checkOverduePayrollsUseCase.getSingleSelectValue(card, "Status") ??
      "Sem status"

    for (const rule of overdueRules) {
      if (!rule.currentStatuses.includes(status)) continue

      let overdue = false //indica se o card está atrasado ou não
      let reason = ""

      const dueDateStr = checkOverduePayrollsUseCase.getDateValue(
        card,
        rule.dueDateField
      )

      if (dueDateStr) {
        if (isDateOverdue(dueDateStr)) {
          overdue = true
          reason = `${rule.dueDateField} venceu em ${dayjs(dueDateStr)
            .tz(TIMEZONE)
            .format("YYYY-MM-DD")}`
        }
      } else if (rule.fallbackDateCheck?.()) {
        overdue = true
        reason = `Fallback estático da regra "${rule.dueDateField}"`
      }

      if (overdue && status !== rule.targetStatus) {
        console.log(
          `Movendo "${
            card.content?.title ?? "Sem título"
          }" de "${status}" para "${rule.targetStatus}" - ${reason}`
        )

        await checkOverduePayrollsUseCase.updateStatusOfItem(
          card.id,
          rule.targetStatus
        )

        card.status = rule.targetStatus

        // --- envio de e-mail ---
        if (rule.notify?.to?.length) {
          const emailService = new NodemailerEmailService()
          const htmlCompiler = new HandlebarsHtmlCompiler()
          const sendEmailUseCase = new SendCheckOverdueEmailUseCase(
            emailService,
            htmlCompiler
          )

          const messageMap: Record<string, string> = {
            "Em Atraso de Empenho": `
            <p>Comunicamos que o processo referente ao ${card.content?.title} encontra-se em atraso de empenho, o que tem impacto direto no cronograma.</p>
            <p>Ressaltamos a importância da regularização do empenho para evitar novos reflexos nas etapas seguintes (liquidação e pagamento).</p>
            `,

            "Em Atraso de Liquidação": `<p>Informamos que o processo vinculado ao ${card.content?.title} encontra-se em atraso de liquidação,  impossibilitando o avanço para a etapa final de pagamento.</p>
            
            <p>Solicitamos a devida atenção para a regularização, a fim de assegurar a continuidade das atividades programadas e o cumprimento dos prazos pactuados.</p>`,

            "Em Atraso de PD": `<p>Registramos que o processo referente ao ${card.content?.title} encontra-se em atraso de pagamento, gerando dificuldades na manutenção regular das atividades previstas</p>.
            
            <p>Solicitamos especial atenção para a finalização do processo, garantindo o cumprimento das obrigações financeiras e a regularidade da execução do projeto.</p>`,

            "Em Atraso de OB": `<p>O processo referente ao ${card.content?.title} encontra-se em atraso de OB, impactando o andamento das etapas finais.</p>`,
          }

          await sendEmailUseCase.execute({
            to: rule.notify.to,
            cc: rule.notify.cc ?? [],
            projectName: card.content?.title ?? "Projeto sem título",
            delayedProject: rule.targetStatus,
            message: messageMap[rule.targetStatus] ?? "",
            remetenteNome: "Augusto",
            remetenteCargo: "Cargo/Função",
            linkQuadro:
              "https://github.com/orgs/propegi-upe/projects/12/views/1",
          })
        }

        break
      }
    }
  }
}

main().catch((e) => {
  console.error("Erro ao executar o script:", e)
})
