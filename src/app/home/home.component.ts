import { Component, OnInit } from '@angular/core';
import { SearchInput } from '../shared/searchInput';
import { PokemonInput } from '../shared/pokemonInput.model';
import { SearchTypeModel } from '../shared/searchType.model';
import { PokemonModel } from '../shared/pokemon.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public searchTypes: SearchTypeModel[] = [];
  public pokemonInputs: SearchInput[] = [];

  public pokemonList: string[] = [];

  constructor() {
    this.searchTypes.push(new SearchTypeModel(0, 'Pokemon', 'Pokémon'));
    this.searchTypes.push(new SearchTypeModel(1, 'PokemonVsType', 'Pokémon vs Type'));
    this.searchTypes.push(new SearchTypeModel(2, 'PokemonVsPokemon', 'Pokémon vs Pokémon'));

    this.pokemonList.push("Bulbasaur");
    this.pokemonList.push("Squirtle");
    this.pokemonList.push("Charmander");

    this.selectedSearchType = 'PokemonVsPokemon';
  }

  ngOnInit() { }

  private _selectedSearchType: string;
  get selectedSearchType(): string {
    return this._selectedSearchType;
  }
  set selectedSearchType(selectedSearchType: string) {
    this._selectedSearchType = selectedSearchType;
    this.pokemonInputs = [];
    if (selectedSearchType == 'Pokemon' || selectedSearchType == 'PokemonVsType') {
      this.pokemonInputs.push(new PokemonInput('pokemon', 'Attacker', new PokemonModel(1, 'Bulbasaur')));
    }
    else if (selectedSearchType == 'PokemonVsPokemon') {
      this.pokemonInputs.push(new PokemonInput('attacker', 'Attacker', new PokemonModel(1, 'Bulbasaur')));
      this.pokemonInputs.push(new PokemonInput('defender', 'Defender', new PokemonModel(4, 'Charmander')));
    }
  }
}
