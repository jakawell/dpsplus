import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith ,  map } from 'rxjs/operators';
import { PokemonSpecies } from 'pogo-objects';
import { DataService } from '../../services/data.service';
import { PokemonModel } from '../../models/index';

@Component({
  selector: 'app-pokemon-input',
  templateUrl: './pokemon-input.component.html',
  styleUrls: ['./pokemon-input.component.css', '../../../home/home.component.css']
})
export class PokemonInputComponent implements OnInit {
  @Input()
  set id(id: string) {
    this._id = id;
    if (this.model) {
      this.resetForm();
    }
  }
  get id(): string {
    return this._id;
  }

  @Input()
  set model(model: PokemonModel) {
    this._model = model;
  }
  get model(): PokemonModel {
    return this._model;
  }

  @Output() removed: EventEmitter<string> = new EventEmitter<string>();

  public pokemonForm: FormGroup;
  public filteredPokemon: Observable<PokemonSpecies[]>;
  public selectedSpecies: PokemonSpecies;

  private _id: string;
  private _model: PokemonModel;
  private _alphabeticalSpecies: PokemonSpecies[];

  constructor(private formBuilder: FormBuilder, private dataService: DataService) {
    // build the form
    this.pokemonForm = this.formBuilder.group({
      species: '',
      level: '',
      attackIv: '',
      defenseIv: '',
      staminaIv: '',
      quickMove: '',
      chargeMove: '',
    });
    this._alphabeticalSpecies = Array.from(dataService.speciesAlphabetical.values());
  }

  ngOnInit() {
    const speciesControl = this.pokemonForm.get('species');
    this.filteredPokemon = speciesControl.valueChanges.pipe(
      startWith<string | PokemonSpecies>(''),
      map(value => typeof value === 'string' ? value : value.speciesName),
      map(name => name ? this.filterPokemon(name) : this._alphabeticalSpecies)
    );
    speciesControl.valueChanges.forEach((value: string | PokemonSpecies) => {
      if (typeof value !== 'string') {
        this.selectedSpecies = value;
        this.model.setSpecies(value);
      }
    });
    this.pokemonForm.get('level').valueChanges.forEach((value: number) => this.model.basePokemon.level = value);
    this.pokemonForm.get('attackIv').valueChanges.forEach((value: number) => this.model.basePokemon.attackIv = value);
    this.pokemonForm.get('defenseIv').valueChanges.forEach((value: number) => this.model.basePokemon.defenseIv = value);
    this.pokemonForm.get('staminaIv').valueChanges.forEach((value: number) => this.model.basePokemon.staminaIv = value);
    this.pokemonForm.get('quickMove').valueChanges.forEach((value: string) => this.model.quickMove = value);
    this.pokemonForm.get('chargeMove').valueChanges.forEach((value: string) => this.model.chargeMove = value);
    this.resetForm();
  }

  public get selectedSpeciesImage() {
    const form = !this.selectedSpecies || this.selectedSpecies.form === 'NORMAL'
      ? ''
      : this.selectedSpecies.form.toLowerCase();
    const extension = this.selectedSpecies.pokedexNumber > 649 || this.selectedSpecies.form === 'GALARIAN'
      ? '.png'
      : '.svg';
    return `${this.selectedSpecies.pokedexNumber}${form}${extension}`;
  }

  public removeSelf() {
    this.removed.emit(this.model.internalId);
  }

  public autoDisplayFn(pokemon: string | PokemonSpecies): string | undefined {
    return pokemon ? (typeof pokemon === 'string' ? pokemon : pokemon.speciesName) : undefined;
  }

  public submitForm() {
    const formModel = this.pokemonForm.value;
    this.model.setSpecies(this.selectedSpecies);
    this.model.basePokemon.level = formModel.level as number;
    this.model.basePokemon.attackIv = formModel.attackIv as number;
    this.model.basePokemon.defenseIv = formModel.defenseIv as number;
    this.model.basePokemon.staminaIv = formModel.staminaIv as number;
    this.model.quickMove = formModel.quickMove as string;
    this.model.chargeMove = formModel.chargeMove as string;
  }

  private filterPokemon(name: string) {
    return this._alphabeticalSpecies.filter(pokemon =>
      pokemon.speciesName.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  private resetForm() {
    this.pokemonForm.reset({
      species: this.model.basePokemon.species,
      level: this.model.basePokemon.level,
      attackIv: this.model.basePokemon.attackIv,
      defenseIv: this.model.basePokemon.defenseIv,
      staminaIv: this.model.basePokemon.staminaIv,
      quickMove: this.model.quickMove,
      chargeMove: this.model.chargeMove,
    });
  }
}
