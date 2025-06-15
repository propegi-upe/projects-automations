import { FastifyInstance } from "fastify"

import { listAllTasksFinancialProjectOrgUseCase } from "@/use-cases/financial/list-all-tasks-financial-project-org" 
import { listAllTasksFinancialProjectRawUseCase } from "@/use-cases/financial/list-all-tasks-financial-project-raw"
import { saveJsonFile } from "@/utils/save-json-file"

export default async function projectsRoutesFinancial(app: FastifyInstance) {
  
  app.get("/projects/financial/org/:projectId", async (request, reply) => {
    const { projectId } = request.params as { projectId: string }

    try {
      const data = await listAllTasksFinancialProjectOrgUseCase(projectId)
      await saveJsonFile(data, `financial-org-${projectId}`)

      return reply.send(data)
    } catch (error) {
      console.error(error)
      return reply.status(500).send({
        error: "Erro ao listar todas as tasks do projeto."
      })
    }
  })

  app.get("/projects/financial/raw/:projectId", async (request, reply) => {
  const { projectId } = request.params as { projectId: string }
  try {
    const columns = await listAllTasksFinancialProjectRawUseCase(projectId)

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
