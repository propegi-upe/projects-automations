import Fastify from "fastify"
import projectsRoute from "./routes/projects.route"

export const app = Fastify()

app.register(projectsRoute)
