export abstract class Transformer <T, S> {
  constructor (private readonly entities: T | T[] | null | undefined) {}

  item (entity: null): null
  item (entity: undefined): undefined
  item (entity: T): S
  item (entity?: T | null): S | null | undefined
  item (entity?: T | null): S | null | undefined {
    if (entity === undefined) return undefined
    if (entity === null) return null

    return this.transform(entity)
  }

  array (entities: null): null
  array (entities: undefined): undefined
  array (entities: T[]): S[]
  array (entities?: T[] | null): S[] | null | undefined
  array (entities?: T[] | null): S[] | null | undefined {
    if (entities === undefined) return undefined
    if (entities === null) return null

    return entities.map(entity => this.transform(entity))
  }

  abstract transform (_entity: T): S

  toJSON (): S | S[] | null | undefined {
    if (Array.isArray(this.entities)) return this.array(this.entities)
    else return this.item(this.entities)
  }
}
