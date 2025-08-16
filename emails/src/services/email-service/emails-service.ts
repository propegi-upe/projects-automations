import { Email } from "@/entities/email" 

export interface EmailsService {
  send(email: Email): Promise<void>
}
