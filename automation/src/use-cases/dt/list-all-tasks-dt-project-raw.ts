import { GitHubProjectsDTService } from "@/services/github-projects-dt-project.service"

// Lista todas as tasks de um projeto com organização
export async function listAllTasksDTProjectRawUseCase(
  projectId: string,
) {
  const service = new GitHubProjectsDTService()
  return await service.listAllTasksDTProjectRaw(projectId)
}
