import { FieldSchema } from "@/field-parser/field-parser"
import { ProjectsService } from "@/services/projects.service"

const schema: FieldSchema = {
  status: { fieldName: "Status", type: "singleSelect" },
  intervenienciaIAUPE: { fieldName: "Mês", type: "text" },
  convenioOuAcordo: { fieldName: "Valor da folha", type: "text" },
  edital: { fieldName: "Recurso", type: "singleSelect" },
  acordoNumero: { fieldName: "SEI mãe", type: "text" },
  aditivoNumero: { fieldName: "SEI", type: "text" },
  tipoAditivo: { fieldName: "Data limite para empenho", type: "date" },
  empresa: { fieldName: "Data limite para liquidação", type: "date" },
  cnpj: { fieldName: "Data limite de PD", type: "date" },
  coordenador: { fieldName: "Empenhada em", type: "date" },
  email: { fieldName: "Liquidada em", type: "date" },
  diasEmAtraso: { fieldName: "Dias em atraso", type: "text" },
}

// Lista todas as tasks de um projeto com organização
export class IncrementOverdueUseCase {
  constructor(private projectService: ProjectsService) {}

  private projectId = "PVT_kwDODE36584A8ZDO"
  private statusFieldId = "PVTSSF_lADODE36584A8ZDOzgwZ5bI"

  async execute() {
    const grouped = await this.projectService.getGroupedTasksFromProject(
      this.projectId,
      schema
    )

    const overdueTasks = Object.entries(grouped)
      .filter(([status]) => status.startsWith("🚨 Em Atraso"))
      .flatMap(([_, tasks]) => tasks)

    console.log(`Encontradas ${overdueTasks.length} tarefas em atraso`)

    for (const task of overdueTasks as Record<string, any>[]) {
      const days = parseInt(task.diasEmAtraso) || 0
      const newValue = days + 1

      console.log(
        `Atualizando tarefa ${task.title} de ${days} para ${newValue} dias em atraso`
      )

      await this.updateStatusOfItem(task.id, newValue.toString())
    }
    console.log("Atualização concluída.")
  }

  private async updateStatusOfItem(
    itemId: string,
    newValue: string
  ): Promise<void> {
    await this.projectService.updateFieldValue(
      this.projectId,
      itemId,
      this.statusFieldId,
      newValue,
      "text"
    )
  }
}
