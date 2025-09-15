import Fastify from "fastify"
import { projectsRoutes } from "./routes/projects.route"

export const app = Fastify()

app.register(projectsRoutes)

