import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { SwUpdate } from '@angular/service-worker';
import { FormBuilder, FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators';
import { SettingsComponent } from '.././settings/settings.component';
import { SearchInput, AppOptions } from '../shared/interfaces';
import { DpsPlusQueryType, SearchInputType, SearchResultsColumn, PokemonModel, SearchTypeModel, TypeInput, WeatherInput, SearchInputDefinition } from '../shared/models';
import { DataService, DpsPlusService, StorageService } from '../shared/services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public inputsForm: FormGroup;
  public searchTypes: SearchTypeModel[] = [];
  public defenderInput: PokemonModel;
  public pokemonInputs: PokemonModel[] = [];
  public weatherInput: WeatherInput;
  public typeInput: TypeInput;
  public pokemonSetCount = 0;
  public maxAddablePokemon: number = 0;
  public currentPokemonSetDef: SearchInputDefinition;
  public results: any[] = [];
  public columns: SearchResultsColumn[] = [];
  public isLoading = true;

  // These private "shadow" lists keep all the previous input objects in memory, even if removed from display
  private shadowDefenderInput: PokemonModel;
  private shadowPokemonInputs: PokemonModel[] = [];
  private shadowWeatherInput: WeatherInput;
  private shadowTypeInput: TypeInput;
  private selectedSetCount?: number = null;

  private defaultSearchType: DpsPlusQueryType = DpsPlusQueryType.CountersVsPokemon;

  private appOptions: AppOptions = {
    showLegacyMoves: true,
    showEventMoves: true,
    showCustomMoves: false,
    showTankiness: true,
    showDpsPlus: true,
    showPercentMaxDps: false,
    showPokemonLevel: false,
    showLineNumbers: false,
    topMovesetDisplayLimit: 0,
  }

  constructor(
      private formBuilder: FormBuilder,
      private dataService: DataService,
      private dpsPlusService: DpsPlusService,
      private storageService: StorageService,
      private swUpdate: SwUpdate,
      private snackBar: MatSnackBar,
      private dialog: MatDialog
    ) {
    this.inputsForm = this.formBuilder.group({
      pokemon: this.formBuilder.array([]),
      weather: '',
      type1: '',
      type2: '',
    })
  }

  ngOnInit() {
    this.searchTypes = this.dpsPlusService.SearchTypes;
    this.storageService.getAppOptions(this.appOptions).then((options: AppOptions) => this.appOptions = options);
    if (this.dataService.isLoaded) {
      this.afterLoad();
    }
    else {
      this.dataService.load(() => {
        this.afterLoad();
      });
    }

    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(event => {
        console.log('Service worker update available.');
        let updateSnack = this.snackBar.open("Update available!", "Reload");
        updateSnack.onAction().subscribe(() => {
          window.location.reload();
        });
      });
      this.swUpdate.checkForUpdate(); // check for update on load
    }
  }

  private afterLoad() {
    this.isLoading = false;

    this.storageService.getLastSearchType()
      .then((searchType: string) => {
        if (searchType) {
          this.setSelectedSearchTypeByCode(DpsPlusQueryType[searchType]);
        }
        else {
          this.setSelectedSearchTypeByCode(this.defaultSearchType);
        }
      });
  }

  openSettings() {
    let settingsResults = this.dialog.open(SettingsComponent, {
      data: Object.assign({}, this.appOptions),
      width: '90%',
      maxWidth: '400px',
    });
    settingsResults.afterClosed().subscribe(newSettings => {
      if (newSettings) {
        this.appOptions = newSettings as AppOptions;
        this.storageService.setAppOptions(this.appOptions);
        if (this.results.length > 0) // if there are current results displayed, rerun them with the new settings
          this.runQuery();
      }
    });
  }

  runQuery() {
    if (this.selectedSearchType) {
      const allPokemon = this.pokemonInputs.concat(this.defenderInput ? [ this.defenderInput ] : []);
      console.log('Running query: ', this.selectedSearchType, allPokemon, this.weatherInput, this.typeInput);

      this.results = [];
      this.columns.splice(0, this.columns.length);
      for (let column of this.selectedSearchType.columns) {
        if (this.pokemonInputs.length == 1 && column.name.startsWith('pokemon'))
          continue;
        if (!this.appOptions.showTankiness && column.name.startsWith('tank'))
          continue;
        if (!this.appOptions.showDpsPlus && column.name.startsWith('dpsPlus'))
          continue;
        if (!this.appOptions.showPokemonLevel && column.name.startsWith('stats'))
          continue;

        this.columns.push(column);
      }

      let queryResults = this.dpsPlusService.runQuery(this.selectedSearchType.code, allPokemon, this.weatherInput, this.typeInput, this.appOptions);
      if (queryResults)
        this.results = queryResults;

      this.saveQuery();
    }
  }

  private setSelectedSearchTypeByCode(code: DpsPlusQueryType) {
    for (let searchType of this.searchTypes) {
      if (searchType.code === code) {
        this.selectedSearchType = searchType;
        break;
      }
    }
  }

  private _selectedSearchType: SearchTypeModel;
  get selectedSearchType(): SearchTypeModel {
    return this._selectedSearchType;
  }
  set selectedSearchType(selectedSearchType: SearchTypeModel) {
    this._selectedSearchType = selectedSearchType;

    if (this.isLoading) {
      this.defaultSearchType = selectedSearchType.code;
    }
    else {
      this.defenderInput = null;
      this.pokemonInputs = []; let pokemonIndex = 0;
      this.weatherInput = null;
      this.typeInput = null;
      this.maxAddablePokemon = 0;
      this.resetPokemonFormArray();

      for (let input of selectedSearchType.inputs) {

        if (input.type == SearchInputType.Defender) {
          if (!this.shadowDefenderInput) {
            this.storageService.getLastDefender().then((defender: PokemonModel) => {
              if (defender) { // found a saved value
                this.shadowDefenderInput = defender;
              }
              else { // no saved value, so creating new one
                this.shadowDefenderInput = new PokemonModel(381, null, this.dataService, input.code, input.name, false, false);
                this.shadowDefenderInput.level = 40;
                this.shadowDefenderInput.attackIv = 15;
                this.shadowDefenderInput.defenseIv = 15;
                this.shadowDefenderInput.staminaIv = 15;
              }
              this.shadowDefenderInput.internalId = input.code;
              this.shadowDefenderInput.internalTitle = input.name;
              this.defenderInput = this.shadowDefenderInput;
            });
          }
          else {
            this.shadowDefenderInput.internalId = input.code;
            this.shadowDefenderInput.internalTitle = input.name;
            this.defenderInput = this.shadowDefenderInput;
          }
        }

        if (input.type == SearchInputType.Pokemon) {
          this.addPokemon(input.code, input.name, false, pokemonIndex++);
        }

        if (input.type == SearchInputType.PokemonSet) {
          if (this.selectedSetCount == null || this.shadowPokemonInputs.length <= 0) {
            this.storageService.getLastCountersCount()
              .then((lastCount: number) => {
                if (lastCount != null && lastCount >= 0) {
                  this.selectedSetCount = lastCount;
                }
                else {
                  this.selectedSetCount = input.options.default;
                }

                this.storageService.getLastCounters()
                  .then((counters: PokemonModel[]) => {
                    if (counters) {
                      this.shadowPokemonInputs = counters;
                    }

                    this.configurePokemonSetFromInput(input, pokemonIndex);
                  });
              });
          }
          else {
            this.configurePokemonSetFromInput(input, pokemonIndex);
          }
        }

        if (input.type == SearchInputType.Weather) {
          if (!this.shadowWeatherInput) { // we don't have a shadow weather in memory
            this.storageService.getLastWeatherInput() // get from storage
              .then((weather: WeatherInput) => {
                if (weather) { // if storage had the value, use it
                  this.shadowWeatherInput = weather;
                  this.shadowWeatherInput.code = input.code;
                  this.shadowWeatherInput.name = input.name;
                }
                else { // if not, create a new one
                  this.shadowWeatherInput = new WeatherInput(input.code, input.name);
                }
                this.weatherInput = this.shadowWeatherInput;
              });
          }
          else { // already have in memory
            this.shadowWeatherInput.code = input.code;
            this.shadowWeatherInput.name = input.name;
            this.weatherInput = this.shadowWeatherInput;
          }
        }

        if (input.type == SearchInputType.Type) {
          if (!this.shadowTypeInput) { // we don't have a shadow type in memory
            this.storageService.getLastTypeInput() // get from storage
              .then((type: TypeInput) => {
                if (type) { // if storage had the value, use it
                  this.shadowTypeInput = type;
                  this.shadowTypeInput.code = input.code;
                  this.shadowTypeInput.name = input.name;
                }
                else { // if not, create a new one
                  this.shadowTypeInput = new TypeInput(input.code, input.name, this.dataService);
                }
                this.typeInput = this.shadowTypeInput;
              });
          }
          else { // already have in memory
            this.shadowTypeInput.code = input.code;
            this.shadowTypeInput.name = input.name;
            this.typeInput = this.shadowTypeInput;
          }
        }
      }
    }
  }

  private configurePokemonSetFromInput(input: SearchInputDefinition, pokemonIndex: number) {
    this.pokemonSetCount = 0;
    const total: number = Math.min(this.selectedSetCount, input.options.max)
    for (let i = 0; i < total; i++) {
      this.addPokemonFromSet(input, pokemonIndex++);
    }
    this.currentPokemonSetDef = input;
    this.maxAddablePokemon = input.options.max;
  }

  private addPokemonFromSet(input: SearchInputDefinition, atIndex: number) {
    this.addPokemon(input.code + this.pokemonSetCount, input.name + (this.pokemonSetCount + 1), this.pokemonSetCount >= input.options.min, atIndex);
    this.pokemonSetCount++;
  }

  private addPokemon(code: string, title: string, isRemovable: boolean, atIndex: number) {
    if (this.shadowPokemonInputs.length <= atIndex) { // we don't have a shadow pokemon in memory
      let defaultPokemon = atIndex == 0 ? 149 : (atIndex == 1 ? 384 : (Math.floor(Math.random() * 386) + 1));
      const newPokemon = new PokemonModel(defaultPokemon, null, this.dataService, code, title, isRemovable, false);
      this.shadowPokemonInputs.push(newPokemon);
    }
    else { // we do have a shadow pokemon, and need to update the code and title
      const shadow = this.shadowPokemonInputs[atIndex];
      shadow.internalId = code;
      shadow.internalTitle = title;
      shadow.isRemovable = isRemovable;
      shadow.canSelectMoves = false;
    }
    const pokemon = this.shadowPokemonInputs[atIndex];
    this.pokemonInputs.push(pokemon);
    this.resetPokemonFormArray();
  }

  public removePokemon(id: string) {
    let pokemonIndex = -1;
    for (let input of this.pokemonInputs) {
      if (input.internalId == id) pokemonIndex = this.pokemonInputs.indexOf(input);
    }
    if (pokemonIndex >= 0) {
      this.pokemonSetCount--; // only set pokemon can be removed
      this.selectedSetCount--;

      // move the removed pokemon to the end of the shadow list
      let tempShadow = this.shadowPokemonInputs[pokemonIndex];
      this.shadowPokemonInputs.splice(pokemonIndex, 1);
      this.shadowPokemonInputs.push(tempShadow);

      // remove the pokemon
      this.pokemonInputs.splice(pokemonIndex, 1);
      this.resetPokemonFormArray();
    }

    // check search query input types for the PokemonSet input type to reset the list title numbers
    let nonSetPokemonCount = 0;
    for (let input of this._selectedSearchType.inputs) {
      if (input.type === SearchInputType.Pokemon) {
        nonSetPokemonCount++;
      }
      else if (input.type === SearchInputType.PokemonSet) {
        for (let i = nonSetPokemonCount; i < this.pokemonInputs.length; i++) {
          this.pokemonInputs[i].internalId = input.code + (i - nonSetPokemonCount);
          this.pokemonInputs[i].internalTitle = input.name + (i - nonSetPokemonCount + 1);
          this.shadowPokemonInputs[i].internalId = input.code + (i - nonSetPokemonCount);
          this.shadowPokemonInputs[i].internalTitle = input.name + (i - nonSetPokemonCount + 1);
        }
        break;
      }
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
      this.selectedSetCount++;
      this.addPokemonFromSet(this.currentPokemonSetDef, this.pokemonInputs.length);
    }
  }

  public calculateFromPokedex() {
    // remove all attackers
    this.pokemonInputs = [];
    this.pokemonSetCount = 0;
    this.selectedSetCount = 0;
    this.runQuery();
  }

  public massageDataCell(columnName: string, value: any): any {
    if (columnName.startsWith('dpsPlus') || columnName.startsWith('tank')) {
      return this.precisionRound(value, 1);
    }
    else {
      return value;
    }
  }

  private saveQuery() {
    this.storageService.setLastSearchType(DpsPlusQueryType[this.selectedSearchType.code]);
    if (this.defenderInput) this.storageService.setLastDefender(this.defenderInput);
    if (this.typeInput) this.storageService.setLastTypeInput(this.typeInput);
    if (this.weatherInput) this.storageService.setLastWeatherInput(this.weatherInput);

    if (this.selectedSetCount != null) this.storageService.setLastCountersCount(this.selectedSetCount);
    this.storageService.setLastCounters(this.shadowPokemonInputs);
  }

  private precisionRound(number, precision): number {
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }
}
