import { v7 as uuidv7 } from 'uuid';

/**
 * Representa um identificador único para entidades do domínio.
 */
export class UniqueEntityId {
    private value: string

    toString(): string {
        return this.value
    }

    toValue(): string {
        return this.value
    }

    /**
    * Cria uma nova instância de UniqueEntityId.
    * @param {string} [value] - Identificador único opcional.
    */
    constructor(value?: string) {
        this.value = value ?? uuidv7()
    }
}