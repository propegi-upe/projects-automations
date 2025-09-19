import { ProjectsService } from "@/services/projects.service"
import { CheckOverduePayrollsUseCase } from "@/use-cases/check-overdue-payrolls/check-overdue-payrolls.use-case"
import { formatISO } from "date-fns"
import dayjs from "dayjs"

const overdueRules = [
  {
    name: "Atraso de Empenho",
    currentStatuses: ["Folhas em Preparação"],
    dueDateField: "Data limite para empenho",
    targetStatus: "Em Atraso de Empenho",
  },
  {
    name: "Atraso de Liquidação",
    currentStatuses: ["Empenhada"],
    dueDateField: "Data limite para liquidação",
    targetStatus: "Em Atraso de Liquidação",
  },
  {
    name: "Atraso de PD",
    currentStatuses: ["Liquidada"],
    dueDateField: "Data limite de PD",
    targetStatus: "Em Atraso de PD",
  },
]

function isDateOverdue(dateStr: string): boolean {
  return dayjs().isAfter(dayjs(dateStr), "day")
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

      const dueDateStr = checkOverduePayrollsUseCase.getDateValue(
        card,
        rule.dueDateField
      )
      if (!dueDateStr) continue

      if (isDateOverdue(dueDateStr) && status !== rule.targetStatus) {
        console.log(
          `Movendo "${card.title}" de "${status}" para "${
            rule.targetStatus
          }" - ${rule.dueDateField} venceu em ${formatISO(
            new Date(dueDateStr),
            {
              representation: "date",
            }
          )}`
        )

        await checkOverduePayrollsUseCase.updateStatusOfItem(
          card.id,
          rule.targetStatus
        )

        // Atualiza o status após a mudança para regras futuras
        card.status = rule.targetStatus
        break
      }
    }
  }
}

main().catch((e) => {
  console.error("Erro ao executar o script:", e)
})
