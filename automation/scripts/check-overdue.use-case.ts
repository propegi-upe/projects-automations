import { ProjectsService } from "@/services/projects.service"
import { CheckOverduePayrollsUseCase } from "@/use-cases/check-overdue-payrolls/check-overdue-payrolls.use-case"
import dayjs from "dayjs"

const overdueRules = [
  {
    currentStatuses: ["Folhas em Preparação"],
    isOverdue: () => dayjs().date() > 24,
    targetStatus: "Em Atraso de Empenho",
  },
  {
    currentStatuses: ["Empenhada"],
    isOverdue: () => dayjs().date() > 28,
    targetStatus: "Em Atraso de Liquidação",
  },
  {
    currentStatuses: ["Liquidada"],
    isOverdue: () => dayjs().date() > 2,
    targetStatus: "Em Atraso de PD",
  },
  {
    currentStatuses: ["Em PD"],
    isOverdue: () => dayjs().date() > 11,
    targetStatus: "Em Atraso de OB",
  },
]

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

      if (rule.isOverdue() && status !== rule.targetStatus) {
        console.log(
          `Movendo "${
            card.content?.title ?? "Sem título"
          }" de "${status}" para "${rule.targetStatus}" - Regra: ${
            rule.targetStatus
          }`
        )

        await checkOverduePayrollsUseCase.updateStatusOfItem(
          card.id,
          rule.targetStatus
        )

        // Atualiza o status para não cair em múltiplas regras
        card.status = rule.targetStatus
        break
      }
    }
  }
}

main().catch((e) => {
  console.error("Erro ao executar o script:", e)
})
