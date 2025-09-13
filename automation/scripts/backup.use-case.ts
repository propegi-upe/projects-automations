import fs from "fs/promises"
import path from "path"
import { config } from "dotenv"
import { ProjectsService } from "../src/services/projects.service.js"
import { saveJsonFile } from "../src/utils/save-json-file.js"
import { GetAllTasksDTProjectOrgUseCase } from "@/use-cases/tech-dev-projects/fetch-all-tasks-tech-dev.use-case.js"

config()

const projectId = "PVT_kwDODE36584A64ML"

const service = new ProjectsService()
const getAllTasksDTProjecsUseCase = new GetAllTasksDTProjectOrgUseCase(service)

const backupDirectory = path.resolve("data/backups")
const maxBackupFiles = 5

//Remove backups antigos para manter no máximo 5
async function removeOldBackups() {
  try {
    const files = await fs.readdir(backupDirectory)
    const backupFiles = files
      .filter((name) => name.startsWith("backup-") && name.endsWith(".json"))
      .sort() // como os nomes têm a data, o sort já funciona

    const overflow = backupFiles.length - maxBackupFiles + 1 // +1 para incluir o novo
    if (overflow > 0) {
      const oldFiles = backupFiles.slice(0, overflow)
      for (const name of oldFiles) {
        const filePath = path.join(backupDirectory, name)
        await fs.unlink(filePath)
        console.log(`Removed old backup: ${name}`)
      }
    }
  } catch (err) {
    console.error("Erro ao remover backups antigos:", err)
  }
}

const main = async () => {
  try {
    await removeOldBackups()

    const data = await getAllTasksDTProjecsUseCase.execute(projectId)
    const today = new Date().toISOString().split("T")[0]

    await saveJsonFile(data, `backups/backup-${today}`)

    console.log("Backup feito com sucesso!")
  } catch (error) {
    console.error("Erro no backup:", error)
    process.exit(1)
  }
}

main()
