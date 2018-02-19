import { Component, OnInit } from '@angular/core';
import { SearchInput } from '../shared/searchInput';
import { PokemonModel, SearchTypeModel, PokemonInput, TypeInput, WeatherInput } from '../shared/models';
import { DataService } from '../shared/services/data.service';
import { DpsPlusService } from '../shared/services/dpsplus.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public searchTypes: SearchTypeModel[] = [];
  public pokemonInputs: PokemonInput[] = [];
  public weatherInputs: WeatherInput[] = [];
  public typeInputs: TypeInput[] = [];
  public pokemonList: any[] = [];
  public results: any[] = [];
  public displayedColumns: string[] = [ 'quickMove', 'chargeMove', 'dpsPlus' ];

  constructor(private dataService: DataService, private dpsPlusService: DpsPlusService) {
    this.searchTypes.push(new SearchTypeModel(0, 'Pokemon', 'Best General Moves'));
    this.searchTypes.push(new SearchTypeModel(1, 'PokemonVsType', 'Best Moves Vs. Type'));
    this.searchTypes.push(new SearchTypeModel(2, 'PokemonVsPokemon', 'Best Moves Vs. Pokémon'));

    if (this.dataService.isLoaded) {
      this.importPokedex(this.dataService.getPokedex());
      this.selectedSearchType = 'PokemonVsPokemon';
    }
    else {
      this.dataService.load(() => {
        this.importPokedex(this.dataService.getPokedex());
        this.selectedSearchType = 'PokemonVsPokemon';
      });
    }
  }

  ngOnInit() { }

  runQuery() {
    console.log('Running query: ', this.selectedSearchType, this.pokemonInputs, this.weatherInputs, this.typeInputs);
    for (let mon of this.pokemonInputs) {
      console.log(mon.name + ": ", mon.value);
    }
    for (let type of this.typeInputs) {
      console.log(type.name + ": ", type);
    }
    for (let weather of this.weatherInputs) {
        console.log(weather.name + ": ", weather);
    }

    if (this.selectedSearchType == 'Pokemon') {
      this.results = this.dpsPlusService.movesetListDPSPlusPoke(this.pokemonInputs[0]);
    }
    else if (this.selectedSearchType == 'PokemonVsType') {
      this.results = this.dpsPlusService.movesetListDPSPlusPokeVsType(this.pokemonInputs[0], this.typeInputs[0]);
    }
    else if (this._selectedSearchType == 'PokemonVsPokemon') {
      this.results = this.dpsPlusService.movesetListDPSPlusPokeVsPoke(this.pokemonInputs[0], this.pokemonInputs[1], this.weatherInputs[0]);
    }
    else {
      this.results = [];
    }
    console.log('DPS+ results: ', this.results);
  }

  private importPokedex(pokedex: any[]) {
    this.pokemonList = pokedex.sort((a, b) => {
      let aLower = a[0].toLowerCase(), bLower = b[0].toLowerCase();
      return (aLower < bLower) ? -1 : ((aLower > bLower) ? 1 : 0);
    });
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
      this.pokemonInputs.push(new PokemonInput('pokemon', 'Pokémon', new PokemonModel(149, this.dataService)));
    }
    else if (selectedSearchType == 'PokemonVsType') {
      this.pokemonInputs.push(new PokemonInput('pokemon', 'Pokémon', new PokemonModel(149, this.dataService)));
      this.typeInputs.push(new TypeInput('types1', 'Counter Type', this.dataService));
    }
    else if (selectedSearchType == 'PokemonVsPokemon') {
      this.pokemonInputs.push(new PokemonInput('attacker', 'Attacker', new PokemonModel(149, this.dataService)));
      this.pokemonInputs.push(new PokemonInput('defender', 'Defender', new PokemonModel(384, this.dataService)));
      this.weatherInputs.push(new WeatherInput('weather', 'Weather'));
    }
  }

  precisionRound(number, precision) {
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }
}
