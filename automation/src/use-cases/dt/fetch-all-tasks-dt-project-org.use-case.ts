import { FieldSchema } from "@/field-parser/field-parser"
import { ProjectsService } from "@/services/projects.service"

const iaupeSchema: FieldSchema = {
  status: { fieldName: "Status", type: "singleSelect" },
  intervenienciaIAUPE: { fieldName: "📁 Interveniência com o IAUPE", type: "singleSelect" },
  convenioOuAcordo: { fieldName: "🤝 Convênio ou acordo", type: "singleSelect" },
  edital: { fieldName: "Edital", type: "singleSelect" },
  acordoNumero: { fieldName: "Acordo/convênio n.º", type: "text" },
  aditivoNumero: { fieldName: "Aditivo n.º", type: "text" },
  tipoAditivo: { fieldName: "Tipo de aditivo", type: "text" },
  empresa: { fieldName: "🏛️ Empresa", type: "text" },
  cnpj: { fieldName: "🧾 CNPJ", type: "text" },
  coordenador: { fieldName: "👤 Coordenador", type: "text" },
  email: { fieldName: "✉️ E-mail", type: "text" },
  telefone: { fieldName: "📞 Telefone", type: "text" },
  inicio: { fieldName: "🗓️ Início", type: "date" },
  termino: { fieldName: "📅 Término", type: "date" },
  sei: { fieldName: "SEI", type: "text" },
  valorPactuado: { fieldName: "💰 🔴 Valor pactuado", type: "text" },
  valorRepassado: { fieldName: "💸 🔴 Valor repassado", type: "text" },
  valorExecutado: { fieldName: "📉 🔴 Valor executado", type: "text" },
  valorContrapartida: { fieldName: "🔄 🔴 Valor contrapartida", type: "text" },
  valorAgencia: { fieldName: "💵 🔵 Valor agência", type: "text" },
  valorUnidade: { fieldName: "💵 🔵 Valor unidade", type: "text" },
  valorIAUPE: { fieldName: "💵 🔵 Valor IAUPE", type: "text" },
  dataPublicacao: { fieldName: "📅 Data publicação", type: "date" },
  publicacao: { fieldName: "📢 Publicação", type: "text" },
  linkPTA: { fieldName: "🔗 Link de acesso ao PTA", type: "text" },
  segmento: { fieldName: "Segmento", type: "singleSelect" },
}

// Lista todas as tasks de um projeto com organização
export async function getAllTasksDTProjectOrgUseCase(
  projectId: string,
) {
  const service = new ProjectsService()
  return await service.getGroupedTasksFromProject(projectId, iaupeSchema)
}
