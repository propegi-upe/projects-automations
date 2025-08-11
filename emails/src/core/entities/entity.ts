import { UniqueEntityId } from "./unique-entity-id"

/**
 * Classe base para todas as entidades do domínio.
 * 
 * @template Props Tipo das propriedades da entidade.
 */
export class Entity<Props> {
    private _id: UniqueEntityId
    protected props: Props

    get id() {
        return this._id
    }

    /**
     * Cria uma nova instância de Entity.
     * @param {Props} props - Propriedades da entidade.
     * @param {UniqueEntityId} [id] - Identificador único opcional.
     */
    protected constructor(props: Props, id?: UniqueEntityId) {
        this.props = props
        this._id = id ?? new UniqueEntityId()
    }
}