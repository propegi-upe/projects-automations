import { Email } from "@/entities/email"
import { EmailsService } from "@/services/email-service/emails-service"

interface SendEmailRequest {
  to: string
  subject: string
  text?: string
  html?: string
}

export class SendEmailUseCase {
  constructor(private emailsService: EmailsService) {}

  async execute(data: SendEmailRequest) {
    const email = Email.create(data)
    await this.emailsService.send(email)
  }
}
