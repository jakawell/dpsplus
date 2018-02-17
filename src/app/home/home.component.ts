import { Component, OnInit } from '@angular/core';
import { SearchInput } from '../shared/searchInput';
import { PokemonModel, SearchTypeModel, PokemonInput, TypeInput, WeatherInput } from '../shared/models';
import { DataService } from '../shared/services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public searchTypes: SearchTypeModel[] = [];
  public pokemonInputs: PokemonInput[] = [];
  public weatherInputs: SearchInput[] = [];
  public typeInputs: SearchInput[] = [];

  public pokemonList: any[] = [];

  constructor(private dataService: DataService) {
    this.searchTypes.push(new SearchTypeModel(0, 'Pokemon', 'Pokémon'));
    this.searchTypes.push(new SearchTypeModel(1, 'PokemonVsType', 'Pokémon vs Type'));
    this.searchTypes.push(new SearchTypeModel(2, 'PokemonVsPokemon', 'Pokémon vs Pokémon'));

    this.dataService.getPokedex(pokedex => {
      this.pokemonList = pokedex.sort((a, b) => {
        let aLower = a[0].toLowerCase(), bLower = b[0].toLowerCase();
        return (aLower < bLower) ? -1 : ((aLower > bLower) ? 1 : 0);
      })
    });

    this.selectedSearchType = 'PokemonVsPokemon';
  }

  ngOnInit() { }

  runQuery() {
    console.log('Running query: ', this.selectedSearchType, this.pokemonInputs, this.weatherInputs, this.typeInputs);
    for (let mon of this.pokemonInputs) {
      console.log(mon.name + ": ", mon.value);
    }
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
      this.pokemonInputs.push(new PokemonInput('pokemon', 'Pokémon', new PokemonModel(1, this.dataService)));
    }
    else if (selectedSearchType == 'PokemonVsType') {
      this.pokemonInputs.push(new PokemonInput('pokemon', 'Pokémon', new PokemonModel(1, this.dataService)));
      this.typeInputs.push(new TypeInput('types1', 'Counter Type'));
    }
    else if (selectedSearchType == 'PokemonVsPokemon') {
      this.pokemonInputs.push(new PokemonInput('attacker', 'Attacker', new PokemonModel(1, this.dataService)));
      this.pokemonInputs.push(new PokemonInput('defender', 'Defender', new PokemonModel(12, this.dataService)));
    }

    this.weatherInputs.push(new WeatherInput('weather', 'Weather'));
  }
}
