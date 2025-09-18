import { FieldSchema, parseFieldValues } from "../field-parser/field-parser"
import { env } from "../env"

export class ProjectsService {
  async getGroupedTasksFromProject(projectId: string, schema?: FieldSchema) {
    let hasNextPage = true
    let endCursor: string | null = null
    const allItems: any[] = []

    while (hasNextPage) {
      const query = `
        query {
          node(id: "${projectId}") {
            ... on ProjectV2 {
              items(first: 100 ${endCursor ? `, after: "${endCursor}"` : ""}) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
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

      const response: Response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.REPOSITORY_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      const json: any = await response.json()

      if (json.errors) {
        console.error(json.errors)
        throw new Error("Erro ao buscar tarefas.")
      }

      if (!json.data || !json.data.node) {
        console.error(
          "Resposta inesperada do GitHub GraphQL:",
          JSON.stringify(json, null, 2)
        )
        throw new Error(
          "Não foi possível carregar o projeto. Verifique se o ID e as permissões estão corretos."
        )
      }

      const page = json.data.node.items
      allItems.push(...page.nodes)

      hasNextPage = page.pageInfo.hasNextPage
      endCursor = page.pageInfo.endCursor
    }

    // Se schema não foi passado, retornamos tudo cru
    if (!schema) {
      return allItems
    }

    // Caso contrário, processamos e agrupamos
    const tasks = allItems.map((item: any) => {
      const parsed = parseFieldValues(item.fieldValues.nodes, schema)
      return {
        Projeto_ID: item.id,
        ...parsed,
      }
    })

    return tasks
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

  getTextValue(item: any, fieldName: string): string | null {
    const field = item.fieldValues.nodes.find(
      (f: any) => f.field?.name === fieldName && f.text !== undefined
    )
    return field?.text ?? null
  }
}
