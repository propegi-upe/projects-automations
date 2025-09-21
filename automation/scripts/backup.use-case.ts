import fs from "fs/promises"
import path from "path"
import { config } from "dotenv"
import { ProjectsService } from "../src/services/projects.service.js"
import { saveJsonFile } from "../src/utils/save-json-file.js"
import { GetAllTasksTechnologicalDevelopmentProjectOrgUseCase } from "@/use-cases/technological-services/fetch-all-tasks/fetch-all-tasks.use-case.js"
import { GetAllTasksFinancialServicesProjectOrgUseCase } from "@/use-cases/financial-services/fetch-all-tasks/fetch-all-tasks.use-case.js"

config()

const service = new ProjectsService()

const getAllTasksDTProjecsUseCase =
  new GetAllTasksTechnologicalDevelopmentProjectOrgUseCase(service)
const getAllTasksFinancialServicesUseCase =
  new GetAllTasksFinancialServicesProjectOrgUseCase(service)

// Configuração dos projetos: cada um sabe qual useCase executar
const projects = [
  {
    id: "PVT_kwDODE36584A64ML",
    dir: "technological-development",
    useCase: getAllTasksDTProjecsUseCase,
  },
  {
    id: "PVT_kwDODE36584A8ZDO",
    dir: "financial-service",
    useCase: getAllTasksFinancialServicesUseCase,
  },
]

const baseBackupDir = path.resolve("data/backups")
const maxBackupFiles = 5

async function removeOldBackups(projectDir: string) {
  const dir = path.join(baseBackupDir, projectDir)

  try {
    await fs.mkdir(dir, { recursive: true })
    const files = await fs.readdir(dir)

    const backupFiles = files
      .filter((name) => name.startsWith("backup-") && name.endsWith(".json"))
      .sort()

    const overflow = backupFiles.length - maxBackupFiles + 1
    if (overflow > 0) {
      const oldFiles = backupFiles.slice(0, overflow)
      for (const name of oldFiles) {
        const filePath = path.join(dir, name)
        await fs.unlink(filePath)
        console.log(`Removed old backup: ${projectDir}/${name}`)
      }
    }
  } catch (err) {
    console.error(`Erro ao remover backups antigos de ${projectDir}:`, err)
  }
}

async function backupProject(
  projectId: string,
  projectDir: string,
  useCase: { execute: (id: string) => Promise<any> }
) {
  try {
    const data = await useCase.execute(projectId)
    const today = new Date().toISOString().split("T")[0]

    const dir = path.join(baseBackupDir, projectDir)
    await fs.mkdir(dir, { recursive: true })

    await saveJsonFile(data, `${dir}/backup-${today}`)
    console.log(
      `Backup do projeto ${projectId} (${projectDir}) feito com sucesso!`
    )
  } catch (error) {
    console.error(`Erro no backup do projeto ${projectId}:`, error)
    process.exit(1)
  }
}

const main = async () => {
  for (const { id, dir, useCase } of projects) {
    await removeOldBackups(dir)
    await backupProject(id, dir, useCase)
  }
}

main()