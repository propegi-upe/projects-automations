import { FastifyInstance } from "fastify"
import { listProjectsUseCase } from "../use-cases/fetch-projects.use-case"
import { listProjectsColumnsUseCase } from "@/use-cases/fetch-attributes-projetcs.use-case"
import { llistTasksByStatusUseCase } from "@/use-cases/fetch-tasks-by-status.use-case"
import { llistAllTasksProjectOrgUseCase } from "@/use-cases/fetch-all-tasks-project-org.use-case"
import { llistAllTasksProjectRawUseCase } from "@/use-cases/fetch-all-tasks-project-raw.use-case"
import { saveJsonFile } from "@/utils/save-json-file"
import { GitHubProjectsService } from "@/services/github-projects.service"

export async function projectsRoutes(app: FastifyInstance) {
  app.get("/projects", async (request, reply) => {
    try {
      const projects = await listProjectsUseCase()
      reply.send(projects)
    } catch (err) {
      reply.status(500).send({ error: "Erro ao buscar projetos do GitHub." })
    }
  })

  app.get("/projects/:projectId/columns", async (request, reply) => {
    const { projectId } = request.params as { projectId: string }
    try {
      const columns = await listProjectsColumnsUseCase(projectId)
      return reply.send(columns)
    } catch (error) {
      console.error(error)
      return reply
        .status(500)
        .send({ error: "Erro ao listar colunas do projeto." })
    }
  })

  app.get("/projects/:projectId/:statusOptionId", async (request, reply) => {
    const { projectId } = request.params as { projectId: string }
    const { statusOptionId } = request.params as { statusOptionId: string }
    try {
      const columns = await llistTasksByStatusUseCase(projectId, statusOptionId)
      return reply.send(columns)
    } catch (error) {
      console.error(error)
      return reply
        .status(500)
        .send({ error: "Erro ao listar as tasks de um atributo do projeto." })
    }
  })

  app.get("/projects/org/:projectId", async (request, reply) => {
    const { projectId } = request.params as { projectId: string }
    try {
      const columns = await llistAllTasksProjectOrgUseCase(projectId)

      await saveJsonFile(columns, `project-org-${projectId}`)

      return reply.send(columns)
    } catch (error) {
      console.error(error)
      return reply.status(500).send({
        error: "Erro ao listar todas as tasks do projeto com organização.",
      })
    }
  })

  app.get("/projects/raw/:projectId", async (request, reply) => {
    const { projectId } = request.params as { projectId: string }
    try {
      const columns = await llistAllTasksProjectRawUseCase(projectId)

      await saveJsonFile(columns, `project-raw-${projectId}`)

      return reply.send(columns)
    } catch (error) {
      console.error(error)
      return reply
        .status(500)
        .send({ error: "Erro ao listar todas as tasks do projeto original." })
    }
  })

  app.get("/projects/:projectId", async (request, reply) => {
    const { projectId } = request.params as { projectId: string }
    try {
      const service = new GitHubProjectsService()
      const columns = await service.listAll(projectId)

      return reply.send(columns)
    } catch (error) {
      console.error(error)
      return reply
        .status(500)
        .send({ error: "Erro ao listar todas as tasks do projeto original." })
    }
  })
}
