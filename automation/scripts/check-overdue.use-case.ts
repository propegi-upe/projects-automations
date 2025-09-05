import { CheckOverduePayrollsUseCase } from "@/use-cases/check-overdue-payrolls/check-overdue-payrolls.use-case"
import dayjs from "dayjs"

const BOARD_ID = "PVT_kwDODE36584A8ZDO" 

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
  const checkOverduePayrollsUseCase = new CheckOverduePayrollsUseCase()
  const allCards = await checkOverduePayrollsUseCase.getGroupedTasksFromProject(
    BOARD_ID
  )

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
