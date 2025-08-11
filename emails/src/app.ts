import Fastify from "fastify"
import { emailRoutes } from "./http/routes/email.routes" 

export const app = Fastify()

app.register(emailRoutes)
