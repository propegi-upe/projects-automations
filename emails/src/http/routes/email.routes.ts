import { FastifyInstance } from "fastify"
import { sendEmailController } from "../controllers/send-email.controller"
import { sendAddendumEmailController } from "../controllers/send-addend-email.controller"
import { sendClosureEmailController } from "../controllers/send-closure-email.controller"

export async function emailRoutes(app: FastifyInstance) {
  app.post("/send-email", sendEmailController)
  app.post("/send-email/addendum", sendAddendumEmailController)
  app.post("/send-email/closure", sendClosureEmailController)
}
