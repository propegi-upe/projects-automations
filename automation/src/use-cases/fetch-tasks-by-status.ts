import { GitHubProjectsService } from "../services/github-projects.service"

// Lista as tasks de colunas especificas
export async function llistTasksByStatusUseCase(
  projectId: string,
  statusOptionId: string
) {
  const service = new GitHubProjectsService()
  return await service.listTasksByStatus(projectId, statusOptionId)
}
