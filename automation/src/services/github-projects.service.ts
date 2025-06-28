import { env } from "@/env"

export class GitHubProjectsService {
  //método assíncrono que recebe o nome da organização (`org`), como por exemplo "propegi-upe"
  async listProjects(org: string) {
    // query GraphQL que será enviada à API do GitHub
    const query = `
      query {
        organization(login: "${org}") {
          projectsV2(first: 20) {
            nodes {
              id
              title
            }
          }
        }
      }
    `

    // organization(login: "..."): acessa uma organização pelo nome
    // projectsV2(first: 20): pega os 20 primeiros projetos (Projects V2) dessa organização
    // nodes { id title }: define que queremos apenas o id e o title de cada projeto

    // Se fosse usar gh CLI PRECISARIA ESTAR INSTALADA E LOGADA (via gh auth login) PARA ISSO FUNCIONAR

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.REPOSITORY_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })

    const result = await response.json()

    if (result.errors) {
      console.error("Erro na resposta GraphQL:", result.errors)
      throw new Error("Erro ao buscar projetos do GitHub.")
    }

    //Retorna apenas a lista de projetos (id e título) da organização, que estavam no nodes.
    return result.data.organization.projectsV2.nodes
  }

  // Lista colunas de um projeto
  async listProjectColumns(projectId: string) {
    const query = `
    query {
      node(id: "${projectId}") {
        ... on ProjectV2 {
          fields(first: 100) {
            nodes {
              ... on ProjectV2Field {
                id
                name
                dataType
              }
              ... on ProjectV2SingleSelectField {
                id
                name
                options {
                  id
                  name
                }
              }
              ... on ProjectV2IterationField {
                id
                name
                configuration {
                  iterations {
                    id
                    startDate
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

    const result = await response.json()

    if (result.errors) {
      console.error("Erro na resposta GraphQL:", result.errors)
      throw new Error("Erro ao buscar colunas do projeto.")
    }

    return result.data.node.fields.nodes
  }

  async listTasksByStatus(projectId: string, statusOptionId: string) {
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

    const filtered = items.filter((item: any) =>
      item.fieldValues.nodes.some(
        (field: any) => field.optionId === statusOptionId
      )
    )

    return filtered
  }

  async listAllTasksProjectOrg(projectId: string) {
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
                ... on ProjectV2ItemFieldIterationValue {
                  iterationId
                  title
                  field {
                    ... on ProjectV2IterationField {
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
        item.fieldValues.nodes.find((f: any) => f?.field?.name === fieldName) ??
        {}

      const task = {
        id: item.id,
        title: item.content?.title ?? "Sem título",
        body: item.content?.body ?? null,
        url: item.content?.url ?? null,
        status: fieldValue("Status").name ?? null,
        statusOptionId: fieldValue("Status").optionId ?? null,
        side: fieldValue("Side").name ?? null,
        project: fieldValue("Projeto").name ?? null,
        issueType: fieldValue("Issue Type").name ?? null,
        priority: fieldValue("Priority").name ?? null,
        storyPoints: fieldValue("Story Points").name ?? null,
        iteration: fieldValue("Iteration").title ?? null,
        iterationId: fieldValue("Iteration").iterationId ?? null,
      }

      const statusGroup = task.status ?? "Sem status"
      if (!groupedTasks[statusGroup]) {
        groupedTasks[statusGroup] = []
      }

      groupedTasks[statusGroup].push(task)
    }

    return groupedTasks
  }

  async listAllTasksProjectRaw(projectId: string) {
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
                ... on ProjectV2ItemFieldIterationValue {
                  iterationId
                  title
                  field {
                    ... on ProjectV2IterationField {
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
