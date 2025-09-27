import { OverdueRule } from "@/entities/overdue-rule"
import { ProjectsService } from "@/services/projects.service"
import dayjs from "dayjs"
import { SendCheckOverdueEmailUseCase } from "../send-email-check-overdue-columns/send-email-check-overdue-columns.use-case"

export class CheckOverduePayrollsUseCase {
  private statusOptionIds: Record<string, string> = {
    "Folhas em Preparação": "f75ad846",
    "Em Atraso de Empenho": "2123d802",
    Empenhada: "61e4505c",
    "Em Atraso de Liquidação": "e67a2e5f",
    Liquidada: "47fc9ee4",
    "OB Emitida": "98236657",
    "Em PD": "df73e18b",
    "Em Atraso de PD": "73d00594",
    "Em Atraso de OB": "1c0ce8b2",
  }

  private statusFieldId = "PVTSSF_lADODE36584A8ZDOzgwZ5bI"
  private projectId = "PVT_kwDODE36584A8ZDO"

  constructor(
    private projectsService: ProjectsService,
    private rules: OverdueRule[],
    private timezone: string,
    private sendEmailUseCase: SendCheckOverdueEmailUseCase
  ) {}

  async execute(): Promise<void> {
    const allCards = await this.projectsService.getGroupedTasksFromProject(
      this.projectId
    )

    for (const card of allCards) {
      const status =
        this.projectsService.getSingleSelectValue(card, "Status") ??
        "Sem status"

      for (const rule of this.rules) {
        if (!rule.currentStatuses.includes(status)) continue

        let overdue = false //indica se o card está atrasado ou não
        let reason = ""

        const dueDateStr = this.projectsService.getDateValue(
          card,
          rule.dueDateField
        )

        if (dueDateStr && this.isDateOverdue(dueDateStr)) {
          overdue = true
          reason = `${rule.dueDateField} venceu em ${dayjs(dueDateStr)
            .tz(this.timezone)
            .format("YYYY-MM-DD")}`
        } else if (rule.fallbackDateCheck?.()) {
          overdue = true
          reason = `Fallback da regra "${rule.dueDateField}"`
        }

        if (overdue && status !== rule.targetStatus) {
          const projectTitle = card.content?.title ?? "Projeto sem título"

          console.log(
            `Movendo "${projectTitle}" de "${status}" para "${rule.targetStatus}" - ${reason}`
          )

          // Atualiza no repositório
          await this.updateStatusOfItem(card.id, rule.targetStatus)

          card.status = rule.targetStatus

          // Notifica se houver regra
          if (rule.notify?.to?.length) {
            await this.sendEmailUseCase.execute({
              to: rule.notify.to,
              cc: rule.notify.cc ?? [],
              projectName: projectTitle ?? "Projeto sem título",
              delayedProject: rule.targetStatus,
              message: this.getMessage(
                rule.targetStatus,
                card.content?.title ?? ""
              ),
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

  private isDateOverdue(dateStr: string): boolean {
    return dayjs()
      .tz(this.timezone)
      .isAfter(dayjs(dateStr).tz(this.timezone), "day")
  }

  private async updateStatusOfItem(
    itemId: string,
    newStatus: string
  ): Promise<void> {
    const optionId = this.statusOptionIds[newStatus]
    if (!optionId) {
      console.warn(`Option ID não encontrado para status: ${newStatus}`)
      return
    }

    await this.projectsService.updateFieldValue(
      this.projectId,
      itemId,
      this.statusFieldId,
      optionId,
      "singleSelectOptionId"
    )
  }

  private getMessage(targetStatus: string, projectTitle: string): string {
    const messageMap: Record<string, string> = {
      "Em Atraso de Empenho": `
        <p>Prezadas,</p>
        <p>Comunicamos que o processo referente ao <b>${projectTitle}</b> encontra-se <b>Em Atraso de Empenho</b>, o que tem ocasionado impacto direto no cronograma de execução das atividades.</p>
        <p>Ressaltamos a importância da regularização do empenho para evitar novos reflexos nas etapas seguintes (liquidação e pagamento).</p>
      `,
      "Em Atraso de Liquidação": `
        <p>Prezadas,</p>
        <p>Informamos que o processo vinculado ao <b>${projectTitle}</b> encontra-se em atraso de liquidação, impossibilitando o avanço para a etapa final de pagamento.</p>
        <p>Solicitamos a devida atenção para a regularização, a fim de assegurar a continuidade das atividades programadas e o cumprimento dos prazos pactuados.</p>
      `,
      "Em Atraso de PD": `
        <p>Registramos que o processo referente ao <b>${projectTitle}</b> encontra-se em atraso de pagamento, gerando dificuldades na manutenção regular das atividades previstas.</p>
        <p>Solicitamos especial atenção para a finalização do processo, garantindo o cumprimento das obrigações financeiras e a regularidade da execução do projeto.</p>
      `,
      "Em Atraso de OB": `
        <p>O processo referente ao ${projectTitle} encontra-se em atraso de OB.</p>
      `,
    }
    return messageMap[targetStatus] ?? ""
  }
}
