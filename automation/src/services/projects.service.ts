import { FieldSchema, parseFieldValues } from "../field-parser/field-parser"
import { env } from "../env"
import { githubRequest } from "./github-api"

export class ProjectsService {
  async getGroupedTasksFromProject(projectId: string, schema?: FieldSchema) {
    let hasNextPage = true
    let endCursor: string | null = null
    const allItems: any[] = []

    while (hasNextPage) {
      const query: string = `
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
                    ... on Issue { title number url }
                    ... on PullRequest { title number url }
                    ... on DraftIssue { title body }
                  }
                  fieldValues(first: 30) {
                    nodes {
                      ... on ProjectV2ItemFieldSingleSelectValue {
                        optionId
                        name
                        field {
                          ... on ProjectV2SingleSelectField { name }
                        }
                      }
                      ... on ProjectV2ItemFieldTextValue {
                        text
                        field {
                          ... on ProjectV2FieldCommon { name }
                        }
                      }
                      ... on ProjectV2ItemFieldDateValue {
                        date
                        field {
                          ... on ProjectV2FieldCommon { name }
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

      const data: any = await githubRequest<any>(query)

      const page: any = data.node.items
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
        projetoId: item.id,
        nomeProjeto: item.content?.title ?? "Projeto sem título",
        ...parsed,
      }
    })

    return tasks
  }

  async getProjectInfo(projectId: string) {
    const query = `
      query {
        node(id: "${projectId}") {
          ... on ProjectV2 {
            title
            url
          }
        }
      }
    `

    const data = await githubRequest<any>(query)
    return data.node
  }

  async getRealProjectItemId(projectId: string, issueNodeId: string): Promise<string> {
    const mutation = `
      mutation($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
          item {
            id
          }
        }
      }
    `

    const data = await githubRequest<any>(mutation, {
      projectId,
      contentId: issueNodeId,
    })

    return data.addProjectV2ItemById.item.id
  }

  getProjectItemLink(projectUrl: string, itemId: string): string {
    // Extrai a base do projeto (garante que não tenha barra no final)
    const normalizedUrl = projectUrl.replace(/\/$/, "")

    // Monta o link no padrão consistente
    return `${normalizedUrl}/views/1?pane=issue&itemId=${itemId}`
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

  async updateFieldValue(
    projectId: string,
    itemId: string,
    fieldId: string,
    value: string,
    key: string
  ): Promise<void> {
    const mutation = `
      mutation {
        updateProjectV2ItemFieldValue(
          input: {
            projectId: "${projectId}"
            itemId: "${itemId}"
            fieldId: "${fieldId}"
            value: {
              ${key}: "${value}"
            }
          }
        ) {
          projectV2Item {
            id
          }
        }
      }
    `

    await githubRequest<any>(mutation)
  }
}
