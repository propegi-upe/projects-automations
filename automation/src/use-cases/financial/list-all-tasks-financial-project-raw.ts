import { GitHubProjectsFinancialService } from "@/services/github-projects-financial-project.service"

// Lista todas as tasks de um projeto com organização
export async function listAllTasksFinancialProjectRawUseCase(
  projectId: string,
) {
  const service = new GitHubProjectsFinancialService()
  return await service.listAllTasksFinancialProjectRaw(projectId)
}
