import { ProjectsService } from "@/services/projects.service"

export class CheckCompletedProjectsUseCase {
  private statusFieldId = "PVTSSF_lADODE36584A2Eknzg3y7GY"
  private projectId = "PVT_kwDODE36584A2Ekn"
  private optionId = "73c98994" // id da opção "true"

  private statusFieldId_test = "PVTSSF_lADODE36584A64MLzgvV8uc"
  private projectId_test = "PVT_kwDODE36584A64ML"

  constructor(private projectsService: ProjectsService) {}

  async getGroupedTasksFromProject() {
    return this.projectsService.getGroupedTasksFromProject(this.projectId_test)
  }

  getTextValue(item: any, fieldName: string): string | null {
    return this.projectsService.getTextValue(item, fieldName)
  }

  getSingleSelectValue(item: any, fieldName: string): string | null {
    return this.projectsService.getSingleSelectValue(item, fieldName)
  }

  getDateValue(item: any, fieldName: string): string | null {
    return this.projectsService.getDateValue(item, fieldName)
  }

  async updateCardField(itemId: string): Promise<void> {
    await this.projectsService.updateFieldValue(
      this.projectId_test,
      itemId,
      this.statusFieldId_test,
      this.optionId,
      "singleSelectOptionId"
    )
  }
}
