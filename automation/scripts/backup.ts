import { ProjectsService } from '../src/services/projects.service.js'
import { saveJsonFile } from '../src/utils/save-json-file.js'
import { config } from 'dotenv'

config() 

const projectId = 'PVT_kwDODE36584A64ML'

const service = new ProjectsService()

const main = async () => {
  try {
    const data = await service.getGroupedTasksFromProject(projectId)

    await saveJsonFile(data, `backups/backup-${new Date().toISOString().split('T')[0]}`)

    console.log('Backup feito com sucesso!')
  } catch (error) {
    console.error('Erro no backup:', error)
    process.exit(1)
  }
}

main()
