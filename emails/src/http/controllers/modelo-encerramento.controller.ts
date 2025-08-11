import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { NodemailerEmailService } from '@/services/implementation/nodemailer-email-service'
import { SendEncerramentoEmailUseCase } from '@/use-cases/send-encerramento-email.use-case'

const bodySchema = z.object({
  to: z.string(),
  nomeProjeto: z.string(),
  nomeEmpresa: z.string(),
  nomeProfessor: z.string(),
})

export const sendEncerramentoEmailController = async (
	request: FastifyRequest,
	reply: FastifyReply
) => {
	  const service = new NodemailerEmailService()
	  const emailEncerramento = new SendEncerramentoEmailUseCase(service)

	const { to, nomeProjeto, nomeEmpresa, nomeProfessor } = bodySchema.parse(request.body)

	try {
		await emailEncerramento.execute({
			to,
			nomeProjeto,
			nomeEmpresa,
            nomeProfessor
		})
		reply.send({ message: 'E-mail de encerramento enviado com sucesso!' })
	} catch (error) {
		reply.status(500).send({ error: 'Erro ao enviar o e-mail de encerramento' })
	}
}
