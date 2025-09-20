import { Entity } from "@/core/entities/entity" 
import { UniqueEntityId } from "@/core/entities/unique-entity-id"

export interface EmailProps {
  to: string[]
  cc?: string[]
  subject: string
  text?: string
  html?: string
}

export class Email extends Entity<EmailProps> {
  get to() {
    return this.props.to
  }

  get cc() {
    return this.props.cc
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
    if (
      !Array.isArray(props.to) ||
      props.to.length === 0 ||
      props.to.some((email) => !email.trim())
    ) {
      throw new Error("Destinatário não pode estar vazio.")
    }
    if (!props.subject.trim()) throw new Error("Assunto não pode estar vazio.")

    return new Email(props, id)
  }
}
