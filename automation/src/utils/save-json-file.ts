import { writeFile, mkdir } from "fs/promises";
import { dirname } from "path";
import { resolve } from "path";
import { existsSync } from "fs";

export async function saveJsonFile(data: any, filename: string) {
  const filePath = resolve("data", `${filename}.json`);

  const folder = dirname(filePath);

  if (!existsSync(folder)) {
    await mkdir(folder, { recursive: true });
  }

  try {
    await writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`Arquivo salvo em: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error("Erro ao salvar o arquivo JSON:", error);
    throw error;
  }
}

