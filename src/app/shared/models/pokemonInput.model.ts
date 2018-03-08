import { SearchInput, HostPokemonList } from '../interfaces';
import { PokemonModel } from './pokemon.model';

export class PokemonInput implements SearchInput {
  public code: string;
  public name: string;
  public value: PokemonModel;
  public isRemovable: boolean;

  private host: HostPokemonList;

  constructor(code: string, name: string, pokemon: PokemonModel, isRemovable?: boolean, host?: HostPokemonList) {
    this.code = code;
    this.name = name;
    this.value = pokemon;
    this.isRemovable = isRemovable || false;
    this.host = host;
  }

  public removeSelf() {
    if (this.host) this.host.removePokemon(this.code);
  }
}
