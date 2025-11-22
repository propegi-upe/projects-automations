import { ProjectsService } from "@/services/projects.service"
import { GitHubProjectsService } from "../services/github-projects.service"

// Lista com ID e título dos projetos da organização
const projectId_test = "PVT_kwDODE36584A8ZDO"

export async function listProjectsUseCase() {

  const service = new GitHubProjectsService()
  const project = new ProjectsService()
  const info = await project.getProjectInfo(projectId_test)
  const link = project.getProjectItemLink(info.url, "127483724")

  console.log(link)

  return await service.listProjects("propegi-upe")
}
