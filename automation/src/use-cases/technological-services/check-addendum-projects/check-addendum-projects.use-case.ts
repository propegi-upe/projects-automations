import { ProjectsService } from "@/services/projects.service"

export class CheckAddendumProjectsUseCase {
  private statusOptionIds: Record<string, string> = {
    "🔄 Em Andamento": "511501b7",
    "🚨 A Vencer": "c9370880",
  }

  private statusFieldId = "PVTSSF_lADODE36584A2EknzgrcBTc"
  private projectId = "PVT_kwDODE36584A2Ekn"

  private statusFieldId_test = "PVTSSF_lADODE36584A64MLzgvV8uc"
  private projectId_test = "PVT_kwDODE36584A64ML"

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

    await this.projectsService.updateFieldValue(
      this.projectId,
      itemId,
      this.statusFieldId,
      optionId,
      "singleSelectOptionId"
    )
  }
}
