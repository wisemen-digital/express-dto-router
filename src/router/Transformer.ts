export abstract class Transformer <T, S> {
  item (entity: null): null
  item (entity: undefined): undefined
  item (entity: T): S
  item (entity: T | null): S | null
  item (entity: T | undefined): S | undefined
  item (entity?: T | null): S | null | undefined
  item (entity?: T | null): S | null | undefined {
    if (entity === undefined) return undefined
    if (entity === null) return null

    return this.transform(entity)
  }

  array (entities: null): null
  array (entities: undefined): undefined
  array (entities: T[]): S[]
  array (entities: T[] | null): S[] | null
  array (entities: T[] | undefined): S[] | undefined
  array (entities?: T[] | null): S[] | null | undefined
  array (entities?: T[] | null): S[] | null | undefined {
    if (entities === undefined) return undefined
    if (entities === null) return null

    return entities.map(entity => this.transform(entity))
  }

  abstract transform (_entity: T): S
}
