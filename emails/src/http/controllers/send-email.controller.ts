import { FastifyReply, FastifyRequest } from "fastify"
import { SendEmailUseCase } from "@/use-cases/send-email.use-case"; 
import { NodemailerEmailService } from "@/services/email-service/implementations/nodemailer-email-service" 

export async function sendEmailController(
  request: FastifyRequest<{ Body: { to: string; subject: string; text?: string; html?: string } }>,
  reply: FastifyReply
) {
  const service = new NodemailerEmailService()
  const useCase = new SendEmailUseCase(service)

  try {
    await useCase.execute(request.body)
    return reply.send({ message: "E-mail enviado com sucesso!" })
  } catch (err: any) {
    return reply.status(400).send({ error: err.message })
  }
}
