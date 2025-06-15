import Fastify from "fastify"
import { projectsRoutes } from "./routes/projects.route"
import projectsRoutesFinancial from "./routes/projects-financial.routes"
import projectsRoutesDT from "./routes/projects-dt.routes"
import routesFinancial from "./routes/routes/projects-financial.route"
import routesDT from "./routes/routes/projects-dt.routes"

export const app = Fastify()

app.register(projectsRoutes)
app.register(projectsRoutesFinancial)
app.register(projectsRoutesDT)

app.register(routesFinancial)
app.register(routesDT)