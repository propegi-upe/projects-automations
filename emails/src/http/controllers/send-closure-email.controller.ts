import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { NodemailerEmailService } from "@/services/email-service/implementations/nodemailer-email-service"
import {
  SendClosureEmailRequest,
  SendClosureEmailUseCase,
} from "@/use-cases/send-closure-email.use-case"
import { HandlebarsHtmlCompiler } from "@/services/email-service/implementations/handlebars-html-compiler"

const bodySchema = z.object({
  to: z.string(),
  projectName: z.string(),
  companyName: z.string(),
  professorName: z.string(),
})

export const sendClosureEmailController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const service = new NodemailerEmailService()
  const htmlCompiler = new HandlebarsHtmlCompiler<SendClosureEmailRequest>()

  const emailClosure = new SendClosureEmailUseCase(service, htmlCompiler)

  const { to, projectName, companyName, professorName } = bodySchema.parse(
    request.body
  )

  try {
    await emailClosure.execute({
      to,
      projectName,
      companyName,
      professorName,
    })
    reply.send({ message: "E-mail de encerramento enviado com sucesso!" })
  } catch (error) {
    reply.status(500).send({ error: "Erro ao enviar o e-mail de encerramento" })
  }
}
