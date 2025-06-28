import { ProjectsService } from "../src/services/projects.service";
import { env } from "../src/env";

import { FieldSchema } from "@/field-parser/field-parser";

const schema: FieldSchema = {
  status: { fieldName: "Status", type: "singleSelect" },
  intervenienciaIAUPE: { fieldName: "Mês", type: "text" },
  convenioOuAcordo: { fieldName: "Valor da folha", type: "text" },
  edital: { fieldName: "Recurso", type: "singleSelect" },
  acordoNumero: { fieldName: "SEI mãe", type: "text" },
  aditivoNumero: { fieldName: "SEI", type: "text" },
  tipoAditivo: { fieldName: "Data limite para empenho", type: "date" },
  empresa: { fieldName: "Data limite para liquidação", type: "date" },
  cnpj: { fieldName: "Data limite de PD", type: "date" },
  coordenador: { fieldName: "Empenhada em", type: "date" },
  email: { fieldName: "Liquidada em", type: "date" },
  diasEmAtraso: { fieldName: "Dias em atraso", type: "text" },
}

const projectId = "PVT_kwDODE36584A8ZDO"; 

async function incrementOverdueTasks() {
  const service = new ProjectsService();
  const grouped = await service.getGroupedTasksFromProject(projectId, schema);

  const overdueTasks = Object.entries(grouped)
    .filter(([status]) => status.startsWith("Em Atraso"))
    .flatMap(([_, tasks]) => tasks);

  console.log(`Encontradas ${overdueTasks.length} tarefas em atraso`);

  for (const task of overdueTasks as Record<string, any>[]) {
    const dias = parseInt(task.diasEmAtraso) || 0;
    const novoValor = dias + 1;

    console.log(`Atualizando tarefa ${task.title} de ${dias} para ${novoValor} dias em atraso`);

    await updateTaskField(task.id, novoValor.toString());
  }

  console.log("Atualização concluída.");
}

async function updateTaskField(taskId: string, value: string) {
  const query = `
    mutation {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: "${projectId}",
          itemId: "${taskId}",
          fieldId: "PVTF_lADODE36584A8ZDOzgwZ5cY",
          value: { text: "${value}" }
        }
      ) {
        projectV2Item {
          id
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.REPOSITORY_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const json = await response.json();

  if (json.errors) {
    console.error(`Erro ao atualizar tarefa ${taskId}`, json.errors);
    throw new Error("Falha ao atualizar");
  }
}

incrementOverdueTasks();
