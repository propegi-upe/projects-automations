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

  private statusFieldId = "PVTSSF_lADODE36584BGxiszg3uO_o"
  private projectId = "PVT_kwDODE36584BGxis"

  private statusFieldId_test = "PVTSSF_lADODE36584A8ZDOzgwZ5bI"
  private projectId_test = "PVT_kwDODE36584A8ZDO"

  constructor(
    private projectsService: ProjectsService,
    private rules: OverdueRule[],
    private timezone: string,
    private sendEmailUseCase: SendCheckOverdueEmailUseCase
  ) {}

  async execute(): Promise<void> {
    const allCards = await this.projectsService.getGroupedTasksFromProject(
      this.projectId_test
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

          const info = await this.projectsService.getProjectInfo(this.projectId_test)
          console.log("INfo")
          console.log(info)
          const issueNodeId = card.content?.id
          console.log("#### issue node")
          console.log(issueNodeId)

          if (!issueNodeId) {
            console.warn("Card sem issue node_id, não é Issue ou está incompleto.")
            continue
          }

          const realItemId = await this.projectsService.getRealProjectItemId(
            this.projectId_test,
            issueNodeId
          )

          console.log("real item")
          console.log(realItemId)

          const link = this.projectsService.getProjectItemLink(info.url, realItemId)

          console.log("link")
          console.log(link)

          if (rule.targetStatus !== "Em Atraso de OB") {
            const emails = this.getEmails(card, rule.targetStatus)
            console.log(emails)

            await this.sendEmailUseCase.execute({
              to: emails,
              projectName: projectTitle ?? "Projeto sem título",
              delayedProject: rule.targetStatus,
              message: this.getMessage(
                rule.targetStatus,
                card.content?.title ?? ""
              ),
              linkQuadro:
                "https://github.com/orgs/propegi-upe/projects/12/views/1",
            })
          }
          break
        }
      }
    }
  }

  private getEmails(card: any, targetStatus: string): string[] {
    let fieldName: string | null = null

    if (targetStatus === "Em Atraso de Empenho") {
      fieldName = "Notificar em atraso de empenho"
    } else if (targetStatus === "Em Atraso de Liquidação") {
      fieldName = "Notificar em atraso de liquidação"
    } else if (targetStatus === "Em Atraso de PD") {
      fieldName = "Notificar em atraso de pagamento"
    } else {
      return [] // OB não envia email
    }

    const emails = this.projectsService.getTextValue(card, fieldName)
    if (!emails) return []

    return emails
      .split(",")
      .map((e: string) => e.trim())
      .filter((e: string) => e.length > 0)
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
      this.projectId_test,
      itemId,
      this.statusFieldId_test,
      optionId,
      "singleSelectOptionId"
    )
  }

  private getMessage(targetStatus: string, projectTitle: string): string {
    const messageMap: Record<string, string> = {
      "Em Atraso de Empenho": `
        <p>Comunicamos que o processo referente ao <b>"${projectTitle}"</b> encontra-se <b>Em Atraso de Empenho</b>, o que tem ocasionado impacto direto no cronograma de execução das atividades.</p>
        <p>Ressaltamos a importância da regularização do empenho para evitar novos reflexos nas etapas seguintes (liquidação e pagamento).</p>
      `,
      "Em Atraso de Liquidação": `
        <p>Informamos que o processo vinculado ao <b>"${projectTitle}"</b> encontra-se <b>Em Atraso de Liquidação</b>, impossibilitando o avanço para a etapa final de pagamento.</p>
        <p>Solicitamos a devida atenção para a regularização, a fim de assegurar a continuidade das atividades programadas e o cumprimento dos prazos pactuados.</p>
      `,
      "Em Atraso de PD": `
        <p>Registramos que o processo referente ao <b>"${projectTitle}"</b> encontra-se <b>Em Atraso de Pagamento</b>, gerando dificuldades na manutenção regular das atividades previstas.</p>
        <p>Solicitamos especial atenção para a finalização do processo, garantindo o cumprimento das obrigações financeiras e a regularidade da execução do projeto.</p>
      `,
    }
    return messageMap[targetStatus] ?? ""
  }
}
