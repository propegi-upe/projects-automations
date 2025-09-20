import { ProjectsService } from "@/services/projects.service"
import { CheckOverduePayrollsUseCase } from "@/use-cases/check-overdue-payrolls/check-overdue-payrolls.use-case"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

type OverdueRule = {
  currentStatuses: string[]
  dueDateField: string // pega data do card
  fallbackDateCheck?: () => boolean // usado se não houver data
  targetStatus: string
}

const overdueRules: OverdueRule[] = [
  {
    currentStatuses: ["⏳ Folhas em Preparação"],
    dueDateField: "Data limite para empenho",
    fallbackDateCheck: () => dayjs().date() > 24,
    targetStatus: "Em Atraso de Empenho",
  },
  {
    currentStatuses: ["🔒 Empenhada"],
    dueDateField: "Data limite para liquidação",
    fallbackDateCheck: () => dayjs().date() > 28,
    targetStatus: "Em Atraso de Liquidação",
  },
  {
    currentStatuses: ["🧾 Liquidada"],
    dueDateField: "Data limite de PD",
    fallbackDateCheck: () => dayjs().date() > 2,
    targetStatus: "Em Atraso de PD",
  },
  {
    currentStatuses: ["🗓️ Em PD"],
    dueDateField: "Data limite para OB",
    fallbackDateCheck: () => dayjs().date() > 11,
    targetStatus: "Em Atraso de OB",
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
          `🔔 Movendo "${
            card.content?.title ?? "Sem título"
          }" de "${status}" para "${rule.targetStatus}" - ${reason}`
        )

        await checkOverduePayrollsUseCase.updateStatusOfItem(
          card.id,
          rule.targetStatus
        )

        card.status = rule.targetStatus
        break
      }
    }
  }
}

main().catch((e) => {
  console.error("Erro ao executar o script:", e)
})
