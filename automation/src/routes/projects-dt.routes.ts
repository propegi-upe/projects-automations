import { FastifyInstance } from "fastify"

import { saveJsonFile } from "@/utils/save-json-file"

import { listAllTasksDTProjectOrgUseCase } from "@/use-cases/dt/list-all-tasks-dt-project-org"
import { listAllTasksDTProjectRawUseCase } from "@/use-cases/dt/list-all-tasks-dt-project-raw"

export default async function projectsRoutesDT(app: FastifyInstance) {
  
  app.get("/projects/dt/org/:projectId", async (request, reply) => {
    const { projectId } = request.params as { projectId: string }

    try {
      const data = await listAllTasksDTProjectOrgUseCase(projectId)
      await saveJsonFile(data, `dt-org-${projectId}`)

      return reply.send(data)
    } catch (error) {
      console.error(error)
      return reply.status(500).send({
        error: "Erro ao listar todas as tasks do projeto."
      })
    }
  })

  app.get("/projects/dt/raw/:projectId", async (request, reply) => {
  const { projectId } = request.params as { projectId: string }
  try {
    const columns = await listAllTasksDTProjectRawUseCase(projectId)

    await saveJsonFile(columns, `dt-raw-${projectId}`)

    return reply.send(columns)
    } catch (error) {
        console.error(error)
        return reply
        .status(500)
        .send({ error: "Erro ao listar todas as tasks do projeto." })
    }
    })
}
