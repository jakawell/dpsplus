import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { SearchInput, HostPokemonList } from '../interfaces';
import { PokemonModel } from './pokemon.model';

export class PokemonInput implements SearchInput {
  public code: string;
  public name: string;
  public value: PokemonModel;
  public isRemovable: boolean;

  public selectorControl: FormControl = new FormControl();
  public filteredPokemon: Observable<any[]>;

  private host: HostPokemonList;

  constructor(code: string, name: string, pokemon: PokemonModel, isRemovable?: boolean, host?: HostPokemonList) {
    this.code = code;
    this.name = name;
    this.value = pokemon;
    this.isRemovable = isRemovable || false;
    this.host = host;
  }

  ngOnInit() {
    this.filteredPokemon = this.selectorControl.valueChanges.pipe(
      startWith(''), map(val => this.filterPokemon(val))
    )
  }

  public removeSelf() {
    if (this.host) this.host.removePokemon(this.code);
  }

  private filterPokemon(selection: any) {
    return this.host.allPokemonList.filter(pokemon =>
      pokemon[0].toLowerCase().indexOf(selection[0].toLowerCase()) === 0);
  }
}
