import { GitHubProjectsService } from "../services/github-projects.service"

// Lista com ID e título dos projetos da organização
export async function listProjectsUseCase() {
  const service = new GitHubProjectsService()
  return await service.listProjects("propegi-upe")
}
