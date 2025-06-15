import { GitHubProjectsService } from "../services/github-projects.service"

// Lista todas as tasks de um projeto da forma original
export async function llistAllTasksProjectRawUseCase(
  projectId: string,
) {
  const service = new GitHubProjectsService()
  return await service.listAllTasksProjectRaw(projectId)
}
