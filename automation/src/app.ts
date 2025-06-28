import Fastify from "fastify"
import { projectsRoutes } from "./routes/projects.route"

import routesFinancial from "./routes/projects-financial.route"
import routesDT from "./routes/projects-dt.routes"

export const app = Fastify()

app.register(projectsRoutes)

app.register(routesFinancial)
app.register(routesDT)