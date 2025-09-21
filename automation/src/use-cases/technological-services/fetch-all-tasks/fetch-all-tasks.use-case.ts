import { FieldSchema } from "@/field-parser/field-parser"
import { ProjectsService } from "@/services/projects.service"

const schema: FieldSchema = {
  Segmento: { fieldName: "Segmento", type: "text" },
  Status: { fieldName: "Status", type: "singleSelect" },
  "Interveniência com o IA-UPE": { fieldName: "📁 Interveniência com o IAUPE", type: "text" },
  "Convênio ou acordo": { fieldName: "🤝 Convênio ou acordo", type: "text" },
  Edital: { fieldName: "Edital", type: "text" },
  "Acordo/convênio n.º": { fieldName: "Acordo/convênio n.º", type: "text" },
  "Aditivo n.º": { fieldName: "Aditivo n.º", type: "text" },
  "Tipo de aditivo": { fieldName: "Tipo de aditivo", type: "text" },
  Empresa: { fieldName: "🏛️ Empresa", type: "text" },
  CNPJ: { fieldName: "🧾 CNPJ", type: "text" },
  Coordenador: { fieldName: "👤 Coordenador", type: "text" },
  "E-mail": { fieldName: "✉️ E-mail", type: "text" },
  Telefone: { fieldName: "📞 Telefone", type: "text" },
  SEI: { fieldName: "SEI", type: "text" },
  "Valor pactuado": { fieldName: "💰 🔴 Valor pactuado", type: "text" },
  "Valor repassado": { fieldName: "💸 🔴 Valor repassado", type: "text" },
  "Valor executado": { fieldName: "📉 🔴 Valor executado", type: "text" },
  "Valor contrapartida": { fieldName: "🔄 🔴 Valor contrapartida", type: "text" },
  "Valor agência": { fieldName: "💵 🔵 Valor agência", type: "text" },
  "Valor unidade": { fieldName: "💵 🔵 Valor unidade", type: "text" },
  "Valor IA-UPE": { fieldName: "💵 🔵 Valor IAUPE", type: "text" },
  "Data publicação": { fieldName: "📅 Data publicação", type: "date" },
  Publicação: { fieldName: "📢 Publicação", type: "text" },
  "Link de acesso ao PTA": { fieldName: "🔗 Link de acesso ao PTA", type: "text" },
  InícioData: { fieldName: "🗓️ Início", type: "date" },
  TérminoData: { fieldName: "📅 Término", type: "date" },
  "Ano do Projeto": { fieldName: "Ano do Projeto", type: "text" },
}

// Lista todas as tasks de um projeto com organização
export class GetAllTasksTechnologicalDevelopmentProjectOrgUseCase {
  constructor(private projectService: ProjectsService) {}

  async execute(projectId: string) {
    return await this.projectService.getGroupedTasksFromProject(
      projectId,
      schema
    )
  }
}
