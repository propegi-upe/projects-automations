import { EmailsService } from "@/services/emails-service" 
import { Email } from "@/entities/email" 

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
