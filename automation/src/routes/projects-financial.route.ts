import { FastifyInstance } from "fastify"

import { saveJsonFile } from "@/utils/save-json-file"
import { getAllTasksFinancialProjectOrgUseCase } from "@/use-cases/financial/fetch-all-tasks-financial-project-org.use-case"
import { getAllTasksFinancialProjectRawUseCase } from "@/use-cases/financial/fetch-all-tasks-financial-project-raw.use-case"

export default async function routesFinancial(app: FastifyInstance) {
  
  app.get("/financial/org/:projectId", async (request, reply) => {
    const { projectId } = request.params as { projectId: string }

    try {
      const data = await getAllTasksFinancialProjectOrgUseCase(projectId)
      await saveJsonFile(data, `financial-org-${projectId}`)

      return reply.send(data)
    } catch (error) {
      console.error(error)
      return reply.status(500).send({
        error: "Erro ao listar todas as tasks do projeto."
      })
    }
  })

  app.get("/financial/raw/:projectId", async (request, reply) => {
  const { projectId } = request.params as { projectId: string }
  try {
    const columns = await getAllTasksFinancialProjectRawUseCase(projectId)

    await saveJsonFile(columns, `financial-raw-${projectId}`)

    return reply.send(columns)
    } catch (error) {
        console.error(error)
        return reply
        .status(500)
        .send({ error: "Erro ao listar todas as tasks do projeto." })
    }
    })
}
