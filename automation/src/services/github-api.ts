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

  const text = await response.text()

  let json: GraphQLResponse<T>
  try {
    json = JSON.parse(text)
  } catch (err) {
    console.error(
      "❌ Erro ao fazer parse da resposta do GitHub. Resposta bruta:"
    )
    console.error(text)
    throw new Error("Resposta da API do GitHub não é um JSON válido.")
  }

  if (!response.ok) {
    console.error("❌ Requisição GraphQL falhou:")
    console.error("Status:", response.status)
    console.error("Resposta:", JSON.stringify(json, null, 2))
    console.error("Query (trecho):", query.slice(0, 500) + "...")
    throw new Error("Erro na requisição para a API do GitHub.")
  }

  if (json.errors) {
    console.error("❌ Erros retornados pela API do GitHub:")
    console.error(JSON.stringify(json.errors, null, 2))
    console.error("Query (trecho):", query.slice(0, 500) + "...")
    throw new Error("Erro ao consultar GitHub GraphQL API")
  }

  if (!json.data) {
    console.error("❌ Resposta inesperada da API do GitHub (sem campo data):")
    console.error(JSON.stringify(json, null, 2))
    throw new Error("Resposta inesperada da API do GitHub")
  }

  return json.data
}