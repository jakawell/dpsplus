export enum DpsPlusQueryType {
  Pokemon,
  PokemonVsType,
  PokemonVsPokemon,
  CountersAll,
  CountersVsType,
  CountersVsPokemon,
}

export enum SearchInputType {
  Pokemon,
  PokemonSet,
  Weather,
  Type
}

export class SearchInputDefinition {
  constructor(
    public code: string,
    public name: string,
    public type: SearchInputType,
    public options?: SearchInputDefinitionOpts
  ) { }
}

export interface SearchInputDefinitionOpts {
  min: number;
  max: number;
  default: number;
  addTitle: string;
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
