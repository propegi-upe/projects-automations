import { ProjectsService } from '@/services/projects.service'
import { formatISO, isBefore } from 'date-fns'

const BOARD_ID = 'PVT_kwDODE36584A8ZDO'

const overdueRules = [
  {
    name: 'Atraso de Empenho',
    currentStatuses: ['Folhas em Preparação'],
    dueDateField: 'Data limite para empenho',
    targetStatus: 'Em Atraso de Empenho',
  },
  {
    name: 'Atraso de Liquidação',
    currentStatuses: ['Empenhada', 'Em Atraso de Empenho'],
    dueDateField: 'Data limite para liquidação',
    targetStatus: 'Em Atraso de Liquidação',
  },
  {
    name: 'Atraso de PD',
    currentStatuses: ['Liquidada', 'Em Atraso de Liquidação', 'OB Emitida'],
    dueDateField: 'Data limite de PD',
    targetStatus: 'Em Atraso de PD',
  },
]

async function main() {
  const projectService = new ProjectsService()
  const cardsByStatus = await projectService.getGroupedTasksFromProject(BOARD_ID)

  console.log("Print do cardsByStatus")
  console.log(cardsByStatus)

  // Colapsa todos os cards num único array para processamento
  const allCards = Object.values(cardsByStatus).flat() as any[]

  console.log("Print do allCards")
  console.log(allCards)

  for (const card of allCards) {
    const status = (card.status ?? projectService.getSingleSelectValue(card, 'Status')) ?? 'Sem status'

    for (const rule of overdueRules) {
      if (!rule.currentStatuses.includes(status)) continue

      const dueDateStr = projectService.getDateValue(card, rule.dueDateField)
      if (!dueDateStr) continue

      const dueDate = new Date(dueDateStr)
      const today = new Date()

      if (isBefore(dueDate, today) && status !== rule.targetStatus) {
        console.log(
          `Movendo "${card.title}" de "${status}" para "${rule.targetStatus}" - ${rule.dueDateField} venceu em ${formatISO(dueDate, { representation: 'date' })}`
        )

        await projectService.updateStatusOfItem(card.id, rule.targetStatus)

        // Atualiza o status após a mudança para regras futuras
        card.status = rule.targetStatus
        break // interrompe para evitar múltiplas mudanças no mesmo loop
      }
    }
  }
}

main().catch((e) => {
  console.error('Erro ao executar o script:', e)
})
