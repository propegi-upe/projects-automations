import { FastifyInstance } from "fastify"
import { sendEmailController } from "../controllers/send-email.controller"
import { sendAditivoEmailController } from "../controllers/modelo-aditivo.controller" 
import { sendEncerramentoEmailController } from "../controllers/modelo-encerramento.controller"

export async function emailRoutes(app: FastifyInstance) {
  app.post("/send-email", sendEmailController)
  app.post("/send-email/aditivo", sendAditivoEmailController)
  app.post("/send-email/encerramento", sendEncerramentoEmailController)
}
