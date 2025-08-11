import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { NodemailerEmailService } from '@/services/implementation/nodemailer-email-service'
import { SendAditivoEmailUseCase } from '@/use-cases/send-aditivo-email.use-case'

const bodySchema = z.object({
  to: z.string(),
  nomeProjeto: z.string(),
  nomeCoordenador: z.string(),
  nomeEmpresa: z.string(),
})

export const sendAditivoEmailController = async (
	request: FastifyRequest,
	reply: FastifyReply
) => {
	  const service = new NodemailerEmailService()
	  const emailAditivo = new SendAditivoEmailUseCase(service)

	const { to, nomeProjeto, nomeCoordenador, nomeEmpresa } = bodySchema.parse(request.body)

	try {
		await emailAditivo.execute({
			to,
			nomeProjeto,
			nomeCoordenador,
			nomeEmpresa
		})
		reply.send({ message: 'E-mail de aditivo enviado com sucesso!' })
	} catch (error) {
		reply.status(500).send({ error: 'Erro ao enviar o e-mail de aditivo' })
	}
}
