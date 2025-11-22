import { GitHubProjectsService } from "../services/github-projects.service"

// Lista com ID e título dos projetos da organização
const projectId_test = "PVT_kwDODE36584A8ZDO"

export async function listProjectsUseCase() {
  const service = new GitHubProjectsService()

  return await service.listProjects("propegi-upe")
}
