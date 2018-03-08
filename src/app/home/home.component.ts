import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { SwUpdate } from '@angular/service-worker';
import { SearchInput, HostPokemonList } from '../shared/interfaces';
import { DpsPlusQueryType, SearchInputType, SearchResultsColumn, PokemonModel, SearchTypeModel, PokemonInput, TypeInput, WeatherInput, SearchInputDefinition } from '../shared/models';
import { DataService } from '../shared/services/data.service';
import { DpsPlusService } from '../shared/services/dpsplus.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, HostPokemonList {

  public searchTypes: SearchTypeModel[] = [];
  public pokemonInputs: PokemonInput[] = [];
  public weatherInputs: WeatherInput[] = [];
  public typeInputs: TypeInput[] = [];
  public pokemonSetCount = 0;
  public maxAddablePokemon: number = 0;
  public currentPokemonSetDef: SearchInputDefinition;
  public pokemonList: any[] = [];
  public results: any[] = [];
  public displayedColumns: string[] = [];
  public columns: SearchResultsColumn[] = [];

  // These private "shadow" lists keep all the previous input objects in memory, even if removed from display
  private shadowPokemonInputs: PokemonModel[] = [];
  private shadowWeatherInputs: WeatherInput[] = [];
  private shadowTypeInputs: TypeInput[] = [];

  private defaultSearchType: DpsPlusQueryType = DpsPlusQueryType.CountersVsPokemon;

  constructor(
      private dataService: DataService,
      private dpsPlusService: DpsPlusService,
      private swUpdate: SwUpdate,
      private snackBar: MatSnackBar
    ) {

    if (this.dataService.isLoaded) {
      this.searchTypes = this.dpsPlusService.SearchTypes;
      this.importPokedex(this.dataService.getPokedex());
      for (let searchType of this.searchTypes) {
          if (searchType.code == this.defaultSearchType) {
            this.selectedSearchType = searchType;
            break;
          }
      }
    }
    else {
      this.dataService.load(() => {
        this.searchTypes = this.dpsPlusService.SearchTypes;
        this.importPokedex(this.dataService.getPokedex());
        for (let searchType of this.searchTypes) {
            if (searchType.code == this.defaultSearchType) {
              this.selectedSearchType = searchType;
              break;
            }
        }
      });
    }
  }

  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(event => {
        console.log('A newer version is now available. Refresh the page now to update the cache.');
        this.snackBar.open("Refresh page to update.");
      });
      this.swUpdate.checkForUpdate();
    }
  }

  runQuery() {
    if (this.selectedSearchType) {
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
      this.results = [];
      this.columns.splice(0, this.columns.length);
      this.displayedColumns.splice(0, this.displayedColumns.length);
      for (let column of this.selectedSearchType.columns) {
        this.columns.push(column);
        this.displayedColumns.push(column.name);
      }

      let queryResults = this.dpsPlusService.runQuery(this.selectedSearchType.code, this.pokemonInputs, this.weatherInputs, this.typeInputs);
      if (queryResults)
        this.results = queryResults;

      console.log('DPS+ results: ', this.results);
    }
  }

  private importPokedex(pokedex: any[]) {
    this.pokemonList = pokedex.sort((a, b) => {
      let aLower = a[0].toLowerCase(), bLower = b[0].toLowerCase();
      return (aLower < bLower) ? -1 : ((aLower > bLower) ? 1 : 0);
    });
  }

  private _selectedSearchType: SearchTypeModel;
  get selectedSearchType(): SearchTypeModel {
    return this._selectedSearchType;
  }
  set selectedSearchType(selectedSearchType: SearchTypeModel) {
    this._selectedSearchType = selectedSearchType;

    this.pokemonInputs = []; let pokemonIndex = 0;
    this.weatherInputs = []; let weatherIndex = 0;
    this.typeInputs = []; let typeIndex = 0;
    this.maxAddablePokemon = 0;

    for (let input of selectedSearchType.inputs) {

      if (input.type == SearchInputType.Pokemon) {
        this.addPokemon(input.code, input.name, false, pokemonIndex++);
      }

      if (input.type == SearchInputType.PokemonSet) {
        this.pokemonSetCount = 0;
        for (let i = 0; i < input.options.default; i++) {
          this.addPokemonFromSet(input, pokemonIndex++);
        }
        this.currentPokemonSetDef = input;
        this.maxAddablePokemon = input.options.max;
      }

      if (input.type == SearchInputType.Weather) {
        if (this.shadowWeatherInputs.length <= weatherIndex) { // we don't have a shadow weather in memory
          this.shadowWeatherInputs.push(new WeatherInput(input.code, input.name));
        }
        this.shadowWeatherInputs[weatherIndex].code = input.code;
        this.shadowWeatherInputs[weatherIndex].name = input.name;
        this.weatherInputs.push(this.shadowWeatherInputs[weatherIndex++]);
      }

      if (input.type == SearchInputType.Type) {
        if (this.shadowTypeInputs.length <= typeIndex) { // we don't have a shadow type in memory
          this.shadowTypeInputs.push(new TypeInput(input.code, input.name, this.dataService));
        }
        this.shadowTypeInputs[typeIndex].code = input.code;
        this.shadowTypeInputs[typeIndex].name = input.name;
        this.typeInputs.push(this.shadowTypeInputs[typeIndex++]);
      }
    }
  }

  private addPokemonFromSet(input: SearchInputDefinition, atIndex: number) {
    this.addPokemon(input.code + this.pokemonSetCount, input.name + (this.pokemonSetCount + 1), this.pokemonSetCount >= input.options.min, atIndex);
    this.pokemonSetCount++;
  }

  private addPokemon(code: string, name: string, isRemovable: boolean, atIndex: number) {
    if (this.shadowPokemonInputs.length <= atIndex) { // we don't have a shadow pokemon in memory
      let defaultPokemon = atIndex == 0 ? 149 : (atIndex == 1 ? 384 : (Math.floor(Math.random() * 386) + 1));
      this.shadowPokemonInputs.push(new PokemonModel(defaultPokemon, this.dataService));
    }
    this.pokemonInputs.push(new PokemonInput(code, name, this.shadowPokemonInputs[atIndex], isRemovable, this));
  }

  public removePokemon(id: string) {
    let pokemonIndex = -1;
    for (let input of this.pokemonInputs) {
      if (input.code == id) pokemonIndex = this.pokemonInputs.indexOf(input);
    }
    if (pokemonIndex >= 0) {
      this.pokemonSetCount--; // only set pokemon can be removed

      // move the removed pokemon to the end of the shadow list
      let tempShadow = this.shadowPokemonInputs[pokemonIndex];
      this.shadowPokemonInputs.splice(pokemonIndex, 1);
      this.shadowPokemonInputs.push(tempShadow);

      // remove the pokemon
      this.pokemonInputs.splice(pokemonIndex, 1);
    }
  }

  public triggerAddPokemon() {
    if (this.pokemonSetCount < this.maxAddablePokemon && this.currentPokemonSetDef) {
      this.addPokemonFromSet(this.currentPokemonSetDef, this.pokemonInputs.length);
    }
  }

  public massageDataCell(columnName: string, value: any): any {
    if (columnName.startsWith('dpsPlus') || columnName.startsWith('tank')) {
      return this.precisionRound(value, 1);
    }
    else {
      return value;
    }
  }

  private precisionRound(number, precision): number {
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }
}
