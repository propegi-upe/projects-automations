import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { NodemailerEmailService } from "@/services/email-service/implementations/nodemailer-email-service"
import {
  SendAddendumEmailRequest,
  SendAddendumEmailUseCase,
} from "@/use-cases/send-addendum-email.use-case"
import { HandlebarsHtmlCompiler } from "@/services/email-service/implementations/handlebars-html-compiler"

const bodySchema = z.object({
  to: z.string(),
  projectName: z.string(),
  coordinatorName: z.string(),
  companyName: z.string(),
})

export const sendAddendumEmailController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const service = new NodemailerEmailService()
  const htmlCompiler = new HandlebarsHtmlCompiler<SendAddendumEmailRequest>()
  const emailAddendum = new SendAddendumEmailUseCase(service, htmlCompiler)

  const { to, projectName, coordinatorName, companyName } = bodySchema.parse(
    request.body
  )

  try {
    await emailAddendum.execute({
      to,
      projectName,
      coordinatorName,
      companyName,
    })
    reply.send({ message: "E-mail de aditivo enviado com sucesso!" })
  } catch (error) {
    reply.status(500).send({ error: "Erro ao enviar o e-mail de aditivo" })
  }
}
