import { FastifyInstance } from "fastify"
import { listProjectsUseCase } from "../use-cases/list-projects.use-case"
import { listProjectsColumnsUseCase } from "@/use-cases/list-projetcs-columns"
import { llistTasksByStatusUseCase } from "@/use-cases/list-tasks-by-status"

export default async function routes(app: FastifyInstance) {
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
        .send({ error: "Erro ao listar colunas do projeto." })
    }
  })
}
