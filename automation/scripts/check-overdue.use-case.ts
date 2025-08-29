import { CheckOverduePayrollsUseCase } from "@/use-cases/check-overdue-payrolls/check-overdue-payrolls.use-case"
import dayjs from "dayjs"

const BOARD_ID = "PVT_kwDODE36584A8ZDO" 

const overdueRules = [
  {
    name: "Atraso de Empenho",
    currentStatuses: ["Folhas em Preparação"],
    isOverdue: () => dayjs().date() > 24,
    targetStatus: "Em Atraso de Empenho",
  },
  {
    name: "Atraso de Liquidação",
    currentStatuses: ["Empenhada"],
    isOverdue: () => dayjs().date() > 28,
    targetStatus: "Em Atraso de Liquidação",
  },
  {
    name: "Atraso de PD",
    currentStatuses: ["Liquidada"],
    // Se hoje é depois do dia 2 do mês seguinte à data de referência
    isOverdue: () =>
      dayjs().date() > 2 &&
      dayjs().isAfter(dayjs().startOf("month").add(1, "month").date(2), "day"),
    targetStatus: "Em Atraso de PD",
  },
  {
    name: "Atraso de OB",
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
      checkOverduePayrollsUseCase.getSingleSelectValue(card, "Status") ?? "Sem status"

    for (const rule of overdueRules) {
      if (!rule.currentStatuses.includes(status)) continue

      if (rule.isOverdue() && status !== rule.targetStatus) {
        console.log(
          `Movendo "${card.content?.title ?? "Sem título"}" de "${status}" para "${rule.targetStatus}" - Regra: ${rule.name}`
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
