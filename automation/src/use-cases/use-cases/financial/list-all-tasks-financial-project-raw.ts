import { ProjectsService } from "@/services/projects.service"

// Lista todas as tasks de um projeto com organização
export async function getAllTasksFinancialProjectRawUseCase(
  projectId: string,
) {
  const service = new ProjectsService()
  return await service.getGroupedTasksFromProject(projectId)
}
