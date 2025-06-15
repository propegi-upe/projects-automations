import { FieldSchema, parseFieldValues } from "@/field-parser/field-parser"
import { GitHubProjectsFinancialService } from "@/services/github-projects-financial-project.service"
import { ProjectsService } from "@/services/projects.service"


const finacialSchema: FieldSchema = {
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
}
 


// Lista todas as tasks de um projeto com organização
export async function getAllTasksFinancialProjectOrgUseCase(
  projectId: string,
) {
  const service = new ProjectsService()
  return await service.getGroupedTasksFromProject(projectId, finacialSchema)
}
