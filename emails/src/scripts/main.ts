import { NodemailerEmailService } from "@/services/email-service/implementations/nodemailer-email-service"
import { SendEmailUseCase } from "@/use-cases/send-email.use-case"
import "dotenv/config"

const emailData = {
  to: "ejsilva159@gmail.com",
  subject: "Bem-vindo!",
  text: "Seja bem-vindo ao nosso sistema.",
}

async function main() {
  const service = new NodemailerEmailService()
  const useCase = new SendEmailUseCase(service)

  try {
    await useCase.execute(emailData)
    console.log("E-mail enviado com sucesso.")
  } catch (err) {
    console.error("Erro ao enviar e-mail:", err)
  }
}

main()
