import { GitHubProjectsService } from "../services/github-projects.service"

// Lista todas as tasks de um projeto com organização 
export async function llistAllTasksProjectOrgUseCase(
  projectId: string,
) {
  const service = new GitHubProjectsService()
  return await service.listAllTasksProjectOrg(projectId)
}
