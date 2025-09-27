import { ProjectsService } from "../src/services/projects.service";
import { IncrementOverdueUseCase } from "@/use-cases/financial-services/increment-overdue/increment-overdue.use-case"

async function main() {
  const service = new ProjectsService()
  const incrementOverdueUseCase = new IncrementOverdueUseCase(service)
  incrementOverdueUseCase.execute()
}

main().catch((e) => {
  console.error("Erro ao executar o script:", e)
})
