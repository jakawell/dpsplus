import { SearchInput } from './searchInput';
import { PokemonModel } from './pokemon.model';

export class PokemonInput implements SearchInput {
  public code: string;
  public name: string;
  public value: PokemonModel;

  constructor(code: string, name: string, pokemon: PokemonModel) {
    this.code = code;
    this.name = name;
    this.value = pokemon;
  }
}
