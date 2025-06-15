import { env } from "@/env"

export class GitHubProjectsDTService {
 async listAllTasksDTProjectOrg(projectId: string) {
  const query = `
    query {
      node(id: "${projectId}") {
        ... on ProjectV2 {
          items(first: 100) {
            nodes {
              id
              content {
                ... on Issue {
                  title
                  number
                  url
                }
                ... on PullRequest {
                  title
                  number
                  url
                }
                ... on DraftIssue {
                  title
                  body
                }
              }
              fieldValues(first: 30) {
                nodes {
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    optionId
                    name
                    field {
                      ... on ProjectV2SingleSelectField {
                        name
                      }
                    }
                  }
                  ... on ProjectV2ItemFieldTextValue {
                    text
                    field {
                      ... on ProjectV2Field {
                        name
                      }
                    }
                  }
                  ... on ProjectV2ItemFieldDateValue {
                    date
                    field {
                      ... on ProjectV2Field {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.REPOSITORY_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  })

  const json = await response.json()

  if (json.errors) {
    console.error(json.errors)
    throw new Error("Erro ao buscar tarefas.")
  }

  const items = json.data.node.items.nodes
  const groupedTasks: Record<string, any[]> = {}

  for (const item of items) {
    const fieldValue = (fieldName: string) =>
      item.fieldValues.nodes.find((f: any) => f?.field?.name === fieldName) ?? {}

    const task = {
      id: item.id,
      title: item.content?.title ?? "Sem título",
      url: item.content?.url ?? null,
      body: item.content?.body ?? null,
      status: fieldValue("Status").name ?? null,
      intervenienciaIAUPE: fieldValue("📁 Interveniência com o IAUPE").name ?? null,
      convenioOuAcordo: fieldValue("🤝 Convênio ou acordo").name ?? null,
      edital: fieldValue("Edital").name ?? null,
      acordoNumero: fieldValue("Acordo/convênio n.º").text ?? null,
      aditivoNumero: fieldValue("Aditivo n.º").text ?? null,
      tipoAditivo: fieldValue("Tipo de aditivo").text ?? null,
      empresa: fieldValue("🏛️ Empresa").text ?? null,
      cnpj: fieldValue("🧾 CNPJ").text ?? null,
      coordenador: fieldValue("👤 Coordenador").text ?? null,
      email: fieldValue("✉️ E-mail").text ?? null,
      telefone: fieldValue("📞 Telefone").text ?? null,
      inicio: fieldValue("🗓️ Início").date ?? null,
      termino: fieldValue("📅 Término").date ?? null,
      sei: fieldValue("SEI").text ?? null,
      valorPactuado: fieldValue("💰 🔴 Valor pactuado").text ?? null,
      valorRepassado: fieldValue("💸 🔴 Valor repassado").text ?? null,
      valorExecutado: fieldValue("📉 🔴 Valor executado").text ?? null,
      valorContrapartida: fieldValue("🔄 🔴 Valor contrapartida").text ?? null,
      valorAgencia: fieldValue("💵 🔵 Valor agência").text ?? null,
      valorUnidade: fieldValue("💵 🔵 Valor unidade").text ?? null,
      valorIAUPE: fieldValue("💵 🔵 Valor IAUPE").text ?? null,
      dataPublicacao: fieldValue("📅 Data publicação").date ?? null,
      publicacao: fieldValue("📢 Publicação").text ?? null,
      linkPTA: fieldValue("🔗 Link de acesso ao PTA").text ?? null,
      segmento: fieldValue("Segmento").name ?? null,
      }

      const statusGroup = task.status ?? "Sem status"
      if (!groupedTasks[statusGroup]) {
        groupedTasks[statusGroup] = []
      }

      groupedTasks[statusGroup].push(task)
    }

    return groupedTasks
  }


  async listAllTasksDTProjectRaw(projectId: string) {
    const query = `
      query {
        node(id: "${projectId}") {
          ... on ProjectV2 {
            items(first: 100) {
              nodes {
                id
                content {
                  ... on Issue {
                    title
                    number
                    url
                  }
                  ... on PullRequest {
                    title
                    number
                    url
                  }
                  ... on DraftIssue {
                    title
                    body
                  }
                }
                fieldValues(first: 30) {
                  nodes {
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      optionId
                      name
                      field {
                        ... on ProjectV2SingleSelectField {
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldTextValue {
                      text
                      field {
                        ... on ProjectV2Field {
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldDateValue {
                      date
                      field {
                        ... on ProjectV2Field {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.REPOSITORY_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })

    const json = await response.json()

    if (json.errors) {
      console.error(json.errors)
      throw new Error("Erro ao buscar tarefas.")
    }

    return json.data.node.items.nodes
  }
}
