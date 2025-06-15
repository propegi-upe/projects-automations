import { GitHubProjectsService } from "../services/github-projects.service"

// Lista ccolunas dos projetos da organização
export async function listProjectsColumnsUseCase(projectId: string) {
  const service = new GitHubProjectsService()
  return await service.listProjectColumns(projectId)
}
