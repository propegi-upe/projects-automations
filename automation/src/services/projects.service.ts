import { FieldSchema, parseFieldValues } from "../field-parser/field-parser"
import { env } from "../env"

export class ProjectsService {
  async getGroupedTasksFromProject(projectId: string, schema?: FieldSchema) {
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

    // 🔄 Se schema não foi passado, retornamos tudo cru
    if (!schema) {
      return items
    }

    // ✅ Caso contrário, processamos e agrupamos
    const groupedTasks: Record<string, any[]> = {}

    for (const item of items) {
      const parsed = parseFieldValues(item.fieldValues.nodes, schema)

      const task = {
        id: item.id,
        title: item.content?.title ?? "Sem título",
        url: item.content?.url ?? null,
        body: item.content?.body ?? null,
        ...parsed,
      }

      const statusGroup = (task as any).status ?? "Sem status"
      if (!groupedTasks[statusGroup]) {
        groupedTasks[statusGroup] = []
      }

      groupedTasks[statusGroup].push(task)
    }

    return groupedTasks
  }
}
