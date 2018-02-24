export enum DpsPlusQueryType {
  Pokemon,
  PokemonVsType,
  PokemonVsPokemon,
}

export enum SearchInputType {
  Pokemon,
  Weather,
  Type
}

export class SearchInputDefinition {
  constructor(
    public code: string,
    public name: string,
    public type: SearchInputType
  ) { }
}

export class SearchResultsColumn {
  constructor(
    public name: string,
    public display: string,
    public index: number
  ) { }
}

export class SearchTypeModel {
  constructor(
    public code: DpsPlusQueryType,
    public displayName: string,
    public inputs: SearchInputDefinition[],
    public columns: SearchResultsColumn[]
  ) { }
}
