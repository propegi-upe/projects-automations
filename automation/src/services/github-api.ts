import { env } from "../env"

export type GraphQLResponse<T> = {
  data?: T
  errors?: any
}

export async function githubRequest<T>(query: string): Promise<T> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.REPOSITORY_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  })

  const json: GraphQLResponse<T> = await response.json()

  if (json.errors) {
    console.error(json.errors)
    throw new Error("Erro ao consultar GitHub GraphQL API")
  }

  if (!json.data) {
    throw new Error("Resposta inesperada da API do GitHub")
  }

  return json.data
}
