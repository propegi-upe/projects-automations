import { ProjectsService } from "@/services/projects.service"

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

  constructor(private projectsService: ProjectsService) {}

  async getGroupedTasksFromProject() {
    return this.projectsService.getGroupedTasksFromProject(this.projectId)
  }

  getSingleSelectValue(item: any, fieldName: string): string | null {
    return this.projectsService.getSingleSelectValue(item, fieldName)
  }

  getDateValue(item: any, fieldName: string): string | null {
    return this.projectsService.getDateValue(item, fieldName)
  }

  getTextValue(item: any, fieldName: string): string | null {
    return this.projectsService.getTextValue(item, fieldName)
  }

  async updateStatusOfItem(itemId: string, newStatus: string): Promise<void> {
    const optionId = this.statusOptionIds[newStatus]
    if (!optionId) {
      console.warn(`Option ID não encontrado para status: ${newStatus}`)
      return
    }

    await this.projectsService.updateSingleSelectField(
      this.projectId,
      itemId,
      this.statusFieldId,
      optionId
    )
  }
}
