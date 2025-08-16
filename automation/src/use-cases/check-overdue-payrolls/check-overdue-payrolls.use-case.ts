import { env } from '../../env'; 

export class CheckOverduePayrollsUseCase  { 
    async getGroupedTasksFromProject(projectId: string) {
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

    // Retorna o valor de um campo SingleSelect com base no nome do campo
    getSingleSelectValue(item: any, fieldName: string): string | null {
        const field = item.fieldValues.nodes.find(
        (f: any) => f.field?.name === fieldName && f.name !== undefined
        )
        return field?.name ?? null
    }

    //Retorna o valor de um campo Date
    getDateValue(item: any, fieldName: string): string | null {
        const field = item.fieldValues.nodes.find(
        (f: any) => f.field?.name === fieldName && f.date !== undefined
        )
        return field?.date ?? null
    }

    private statusOptionIds: Record<string, string> = {
    "Folhas em Preparação": "f75ad846",
    "Em Atraso de Empenho": "2123d802",
    Empenhada: "61e4505c",
    "Em Atraso de Liquidação": "e67a2e5f",
    Liquidada: "47fc9ee4",
    "OB Emitida": "98236657",
    "Em Atraso de PD": "73d00594",
  }

  private statusFieldId = "PVTSSF_lADODE36584A8ZDOzgwZ5bI"

  async updateStatusOfItem(itemId: string, newStatus: string): Promise<void> {
    const optionId = this.statusOptionIds[newStatus]
    if (!optionId) {
      console.warn(`Option ID não encontrado para status: ${newStatus}`)
      return
    }

    const mutation = `
    mutation {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: "PVT_kwDODE36584A8ZDO"
          itemId: "${itemId}"
          fieldId: "${this.statusFieldId}"
          value: {
            singleSelectOptionId: "${optionId}"
          }
        }
      ) {
        projectV2Item {
          id
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
      body: JSON.stringify({ query: mutation }),
    })

    const json = await response.json()
    if (json.errors) {
      console.error(json.errors)
      throw new Error("Erro ao atualizar status do item.")
    }
  }
}
