import { Entity } from "@/core/entities/entity" 
import { UniqueEntityId } from "@/core/entities/unique-entity-id"

export interface EmailProps {
  to: string
  subject: string
  text?: string
  html?: string
}

export class Email extends Entity<EmailProps> {
  get to() {
    return this.props.to
  }

  get subject() {
    return this.props.subject
  }

  get text() {
    return this.props.text
  }

  get html() {
    return this.props.html
  }

  static create(props: EmailProps, id?: UniqueEntityId) {
    if (!props.to.trim()) throw new Error("Destinatário não pode estar vazio.")
    if (!props.subject.trim()) throw new Error("Assunto não pode estar vazio.")

    return new Email(props, id)
  }
}
