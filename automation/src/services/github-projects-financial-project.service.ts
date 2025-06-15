import { env } from "@/env"

export class GitHubProjectsFinancialService {
  async listAllTasksFinancialProjectOrg(projectId: string) {
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
                fieldValues(first: 20) {
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
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
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
        statusOptionId: fieldValue("Status").optionId ?? null,
        mes: fieldValue("Mês").text ?? null,
        valorFolha: fieldValue("Valor da folha").text ?? null,
        recurso: fieldValue("Recurso").name ?? null,
        seiMae: fieldValue("SEI mãe").text ?? null,
        sei: fieldValue("SEI").text ?? null,
        dataLimiteEmpenho: fieldValue("Data limite para empenho").date ?? null,
        dataLimiteLiquidacao: fieldValue("Data limite para liquidação").date ?? null,
        dataLimitePD: fieldValue("Data limite de PD").date ?? null,
        empenhadaEm: fieldValue("Empenhada em").date ?? null,
        liquidadaEm: fieldValue("Liquidada em").date ?? null,
        // diasEmAtraso: fieldValue("Dias em atraso")?.number ?? null, // incluir quando disponível
      }

      const statusGroup = task.status ?? "Sem status"
      if (!groupedTasks[statusGroup]) {
        groupedTasks[statusGroup] = []
      }

      groupedTasks[statusGroup].push(task)
    }

    return groupedTasks
  }

  async listAllTasksFinancialProjectRaw(projectId: string) {
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
                fieldValues(first: 20) {
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
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
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
