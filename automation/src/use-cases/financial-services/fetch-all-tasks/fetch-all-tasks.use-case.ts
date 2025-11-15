import { FieldSchema } from "@/field-parser/field-parser"
import { ProjectsService } from "@/services/projects.service"

const schema: FieldSchema = {
  Projetos: { fieldName: "Projetos", type: "text" },
  "Projeto de Origem": { fieldName: "Projeto de Origem", type: "text" },
  Ano: { fieldName: "Ano", type: "text" },
  Mês: { fieldName: "Edital", type: "text" },
  "Número do mês": { fieldName: "Número do mês", type: "text" },
  Trimestre: { fieldName: "Trimestre", type: "text" },
  Status: { fieldName: "Status", type: "singleSelect" },
  "Valor da folha": { fieldName: "Valor da folha", type: "text" },
  Recurso: { fieldName: "Categoria do recurso", type: "text" },
  "SEI mãe": { fieldName: "SEI mãe", type: "text" },
  SEI: { fieldName: "SEI", type: "text" },
  "Data limite para empenho": {
    fieldName: "Data limite para empenho",
    type: "date",
  },
  "Data limite para liquidação": {
    fieldName: "Data limite para liquidação",
    type: "date",
  },
  "Data limite de PD": { fieldName: "Data limite de PD", type: "date" },
  "Dias em atraso": { fieldName: "Dias em atraso", type: "text" },
}

// Lista todas as tasks de um projeto com organização
export class GetAllTasksFinancialServicesProjectOrgUseCase {
  constructor(private projectService: ProjectsService) {}

  async execute(projectId: string) {
    return await this.projectService.getGroupedTasksFromProject(
      projectId,
      schema
    )
  }
}
