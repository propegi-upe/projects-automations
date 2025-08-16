import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { NodemailerEmailService } from '@/services/implementation/nodemailer-email-service'
import { SendAddendumEmailUseCase } from "@/use-cases/send-addend-email.use-case"

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
  const emailAddendum = new SendAddendumEmailUseCase(service)

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
