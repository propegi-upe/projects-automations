import { FieldSchema } from "@/field-parser/field-parser"
import { ProjectsService } from "@/services/projects.service"

const schema: FieldSchema = {
  segmento: { fieldName: "Segmento", type: "singleSelect" },
  status: { fieldName: "Status", type: "singleSelect" },
  intervenienciaComOIAUPE: {
    fieldName: "📁 Interveniência com o IAUPE",
    type: "singleSelect",
  },
  convenioOuAcordo: {
    fieldName: "🤝 Convênio ou acordo",
    type: "singleSelect",
  },
  edital: { fieldName: "Edital", type: "singleSelect" },
  acordoConvenioNumero: { fieldName: "Acordo/convênio n.º", type: "text" },
  aditivoNumero: { fieldName: "Aditivo n.º", type: "text" },
  tipoDeAditivo: { fieldName: "Tipo de aditivo", type: "text" },
  empresa: { fieldName: "🏛️ Empresa", type: "text" },
  cnpj: { fieldName: "🧾 CNPJ", type: "text" },
  coordenador: { fieldName: "👤 Coordenador", type: "text" },
  email: { fieldName: "✉️ E-mail", type: "text" },
  telefone: { fieldName: "📞 Telefone", type: "text" },
  sei: { fieldName: "SEI", type: "text" },
  valorPactuado: { fieldName: "💰 🔴 Valor pactuado", type: "text" },
  valorRepassado: { fieldName: "💸 🔴 Valor repassado", type: "text" },
  valorExecutado: { fieldName: "📉 🔴 Valor executado", type: "text" },
  valorContrapartida: {
    fieldName: "🔄 🔴 Valor contrapartida",
    type: "text",
  },
  valorAgencia: { fieldName: "💵 🔵 Valor agência", type: "text" },
  valorUnidade: { fieldName: "💵 🔵 Valor unidade", type: "text" },
  valorIAUPE: { fieldName: "💵 🔵 Valor IAUPE", type: "text" },
  dataPublicacao: { fieldName: "📅 Data publicação", type: "date" },
  publicacao: { fieldName: "📢 Publicação", type: "text" },
  linkDeAcessoAoPTA: {
    fieldName: "🔗 Link de acesso ao PTA",
    type: "text",
  },
  inicioData: { fieldName: "🗓️ Início", type: "date" },
  terminoData: { fieldName: "📅 Término", type: "date" },
}

// Lista todas as tasks de um projeto com organização
export class GetAllTasksTechnologicalDevelopmentProjectOrgUseCase {
  constructor(private projectService: ProjectsService) {}

  async execute(projectId: string) {
    const data = await this.projectService.getGroupedTasksFromProject(
      projectId,
      schema
    )
    // 1. Pegar todos os campos singleSelect do schema
    const singleSelectKeys = Object.keys(schema)
      .filter((key) => schema[key].type === "singleSelect")
      .map((key) => `${key}OptionId`)

    // 2. Remover dinamicamente todos os OptionId
    for (const key of singleSelectKeys) {
      if (key in data) {
        delete data[key as any]
      }
    }

    return data
  }
}


