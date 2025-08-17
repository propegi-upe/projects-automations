import { env } from '../../env'; 

export class CheckCompletedProjectsUseCase {
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

  getTextValue(item: any, fieldName: string): string | null {
    const field = item.fieldValues.nodes.find(
      (f: any) => f.field?.name === fieldName && f.text !== undefined
    )
    return field?.text ?? null
  }

  // Retorna o valor de um campo SingleSelect com base no nome do campo
  getSingleSelectValue(item: any, fieldName: string): string | null {
    const field = item.fieldValues.nodes.find(
      (f: any) => f.field?.name === fieldName && f.name !== undefined
    )
    return field?.name ?? null
  }

  private statusFieldId = "PVTSSF_lADODE36584A64MLzgvV8uc"

  async updateCardField(itemId: string): Promise<void> {
    const optionId = "b0c02715" // id da opção "true"

    const mutation = `
      mutation {
        updateProjectV2ItemFieldValue(
          input: {
            projectId: "PVT_kwDODE36584A64ML"
            itemId: "${itemId}"
            fieldId: "${this.statusFieldId}"
            value: {
              text: "true"
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