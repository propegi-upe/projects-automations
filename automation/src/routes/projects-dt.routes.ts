import { FastifyInstance } from "fastify"

import { saveJsonFile } from "@/utils/save-json-file"

import { getAllTasksDTProjectOrgUseCase } from "@/use-cases/dt/fetch-all-tasks-dt-project-org.use-case"
import { getAllTasksDTProjectRawUseCase } from "@/use-cases/dt/fetch-all-tasks-dt-project-raw.use-case"

export default async function routesDT(app: FastifyInstance) {
  
  app.get("/dt/org/:projectId", async (request, reply) => {
    const { projectId } = request.params as { projectId: string }

    try {
      const data = await getAllTasksDTProjectOrgUseCase(projectId)
      await saveJsonFile(data, `dt-org-${projectId}`)

      return reply.send(data)
    } catch (error) {
      console.error(error)
      return reply.status(500).send({
        error: "Erro ao listar todas as tasks do projeto."
      })
    }
  })

  app.get("/dt/raw/:projectId", async (request, reply) => {
  const { projectId } = request.params as { projectId: string }
  try {
    const columns = await getAllTasksDTProjectRawUseCase(projectId)

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
