import { ProjectsService } from "@/services/projects.service"

export class CheckCompletedProjectsUseCase {
  private statusFieldId = "PVTSSF_lADODE36584A64MLzgzanDA"
  private projectId = "PVT_kwDODE36584A64ML"
  private optionId = "035ff2e8" // id da opção "true"

  constructor(private projectsService: ProjectsService) {}

  async getGroupedTasksFromProject() {
    return this.projectsService.getGroupedTasksFromProject(this.projectId)
  }

  getTextValue(item: any, fieldName: string): string | null {
    return this.projectsService.getTextValue(item, fieldName)
  }

  getSingleSelectValue(item: any, fieldName: string): string | null {
    return this.projectsService.getSingleSelectValue(item, fieldName)
  }

  async updateCardField(itemId: string): Promise<void> {
    await this.projectsService.updateSingleSelectField(
      this.projectId,
      itemId,
      this.statusFieldId,
      this.optionId
    )
  }
}
