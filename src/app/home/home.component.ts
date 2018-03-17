import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { SwUpdate } from '@angular/service-worker';
import { FormBuilder, FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators/map';
import { SearchInput } from '../shared/interfaces';
import { DpsPlusQueryType, SearchInputType, SearchResultsColumn, PokemonModel, SearchTypeModel, TypeInput, WeatherInput, SearchInputDefinition } from '../shared/models';
import { DataService } from '../shared/services/data.service';
import { DpsPlusService } from '../shared/services/dpsplus.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public inputsForm: FormGroup;
  public searchTypes: SearchTypeModel[] = [];
  public pokemonInputs: PokemonModel[] = [];
  public weatherInput: WeatherInput;
  public typeInput: TypeInput;
  public pokemonSetCount = 0;
  public maxAddablePokemon: number = 0;
  public currentPokemonSetDef: SearchInputDefinition;
  public pokemonList: any[] = [];
  public results: any[] = [];
  public displayedColumns: string[] = [];
  public columns: SearchResultsColumn[] = [];

  // These private "shadow" lists keep all the previous input objects in memory, even if removed from display
  private shadowPokemonInputs: PokemonModel[] = [];
  private shadowWeatherInput: WeatherInput;
  private shadowTypeInput: TypeInput;

  private defaultSearchType: DpsPlusQueryType = DpsPlusQueryType.CountersVsPokemon;

  constructor(
      private formBuilder: FormBuilder,
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

    this.inputsForm = this.formBuilder.group({
      pokemon: this.formBuilder.array([]),
      weather: '',
      type1: '',
      type2: '',
    })
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
      console.log('Running query: ', this.selectedSearchType, this.pokemonInputs, this.weatherInput, this.typeInput);

      this.results = [];
      this.columns.splice(0, this.columns.length);
      this.displayedColumns.splice(0, this.displayedColumns.length);
      for (let column of this.selectedSearchType.columns) {
        this.columns.push(column);
        this.displayedColumns.push(column.name);
      }

      let queryResults = this.dpsPlusService.runQuery(this.selectedSearchType.code, this.pokemonInputs, this.weatherInput, this.typeInput);
      if (queryResults)
        this.results = queryResults;

      console.log('DPS+ results: ', this.results);
    }
  }

  public get allPokemonList(): any[] {
    return this.pokemonList;
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
    this.weatherInput = null;
    this.typeInput = null;
    this.maxAddablePokemon = 0;
    this.resetPokemonFormArray();

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
        if (!this.shadowWeatherInput) { // we don't have a shadow weather in memory
          this.shadowWeatherInput = new WeatherInput(input.code, input.name);
        }
        this.weatherInput = this.shadowWeatherInput;
      }

      if (input.type == SearchInputType.Type) {
        if (!this.shadowTypeInput) { // we don't have a shadow type in memory
          this.shadowTypeInput = new TypeInput(input.code, input.name, this.dataService);
        }
        this.typeInput = this.shadowTypeInput;
      }
    }
  }

  private addPokemonFromSet(input: SearchInputDefinition, atIndex: number) {
    this.addPokemon(input.code + this.pokemonSetCount, input.name + (this.pokemonSetCount + 1), this.pokemonSetCount >= input.options.min, atIndex);
    this.pokemonSetCount++;
  }

  private addPokemon(code: string, title: string, isRemovable: boolean, atIndex: number) {
    if (this.shadowPokemonInputs.length <= atIndex) { // we don't have a shadow pokemon in memory
      let defaultPokemon = atIndex == 0 ? 149 : (atIndex == 1 ? 384 : (Math.floor(Math.random() * 386) + 1));
      this.shadowPokemonInputs.push(new PokemonModel(defaultPokemon, this.dataService, code, title, isRemovable, false));
    }
    else { // we do have a shadow pokemon, and need to update the code and title
      const shadow = this.shadowPokemonInputs[atIndex];
      shadow.internalId = code;
      shadow.internalTitle = title;
      shadow.isRemovable = isRemovable;
      shadow.canSelectMoves = false;
    }
    this.pokemonInputs.push(this.shadowPokemonInputs[atIndex]);
    this.resetPokemonFormArray();
  }

  public removePokemon(id: string) {
    let pokemonIndex = -1;
    for (let input of this.pokemonInputs) {
      if (input.internalId == id) pokemonIndex = this.pokemonInputs.indexOf(input);
    }
    if (pokemonIndex >= 0) {
      this.pokemonSetCount--; // only set pokemon can be removed

      // move the removed pokemon to the end of the shadow list
      let tempShadow = this.shadowPokemonInputs[pokemonIndex];
      this.shadowPokemonInputs.splice(pokemonIndex, 1);
      this.shadowPokemonInputs.push(tempShadow);

      // remove the pokemon
      this.pokemonInputs.splice(pokemonIndex, 1);
      this.resetPokemonFormArray();
    }
  }

  private resetPokemonFormArray() {
    // const pokemonFormGroups = this.pokemonInputs.map(input => this.formBuilder.group(input));
    // const pokemonFormArray = this.formBuilder.array(pokemonFormGroups);
    // console.log('Updating array with ' + pokemonFormArray.controls.length + ' items.');
    // this.inputsForm.setControl('pokemon', pokemonFormArray);
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
