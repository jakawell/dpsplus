import { Component, OnInit } from '@angular/core';
import { SearchInput } from '../shared/searchInput';
import { PokemonInput } from '../shared/pokemonInput.model';
import { WeatherInput } from '../shared/weatherInput.model';
import { TypeInput } from '../shared/typeInput.model';
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
  public weatherInputs: SearchInput[] = [];
  public typeInputs: SearchInput[] = [];

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

  runQuery() {
    console.log('Running query: ', this.selectedSearchType, this.pokemonInputs, this.weatherInputs, this.typeInputs);
  }

  private _selectedSearchType: string;
  get selectedSearchType(): string {
    return this._selectedSearchType;
  }
  set selectedSearchType(selectedSearchType: string) {
    this._selectedSearchType = selectedSearchType;
    this.pokemonInputs = [];
    this.weatherInputs = [];
    this.typeInputs = [];

    if (selectedSearchType == 'Pokemon') {
      this.pokemonInputs.push(new PokemonInput('pokemon', 'Pokémon', new PokemonModel(1, 'Bulbasaur')));
    }
    else if (selectedSearchType == 'PokemonVsType') {
      this.pokemonInputs.push(new PokemonInput('pokemon', 'Pokémon', new PokemonModel(1, 'Bulbasaur')));
      this.typeInputs.push(new TypeInput('types1', 'Counter Type'));
    }
    else if (selectedSearchType == 'PokemonVsPokemon') {
      this.pokemonInputs.push(new PokemonInput('attacker', 'Attacker', new PokemonModel(1, 'Bulbasaur')));
      this.pokemonInputs.push(new PokemonInput('defender', 'Defender', new PokemonModel(4, 'Charmander')));
    }

    this.weatherInputs.push(new WeatherInput('weather', 'Weather'));
  }
}
