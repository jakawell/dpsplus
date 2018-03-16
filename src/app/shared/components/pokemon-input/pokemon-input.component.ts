import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { PokemonModel } from '../../models';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-pokemon-input',
  templateUrl: './pokemon-input.component.html',
  styleUrls: ['./pokemon-input.component.css', '../../../home/home.component.css']
})
export class PokemonInputComponent implements OnInit {
  @Input() model: PokemonModel;
  @Output() removed: EventEmitter<string> = new EventEmitter<string>();

  public pokemonForm: FormGroup;
  public filteredPokemon: Observable<any[]>;
  public selectedSpecies: number;
  public selectedName: string;

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
  }

  ngOnInit() {
    const speciesControl = this.pokemonForm.get('species');
    this.filteredPokemon = speciesControl.valueChanges.pipe(
      startWith<string | any[]>(''),
      map(value => typeof value === 'string' ? value : value[0]),
      map(name => name ? this.filterPokemon(name) : this.dataService.getPokedex().slice())
    );
    speciesControl.valueChanges.forEach((value: string | any[]) => {
      if (typeof value !== 'string') {
        console.log('Object value selected: ', value);
        this.selectedName = value[0];
        this.selectedSpecies = value[1];
      }
    })
    this.resetForm();
  }

  public removeSelf() {
    this.removed.emit(this.model.internalId);
  }

  public autoDisplayFn(pokemon?: any[]): string | undefined {
    return pokemon ? (typeof pokemon === 'string' ? pokemon : pokemon[0]) : undefined;
  }

  public submitForm() {
    const formModel = this.pokemonForm.value;
    this.model.species = this.selectedSpecies;
    this.model.level = formModel.level as number;
    this.model.attackIv = formModel.attackIv as number;
    this.model.defenseIv = formModel.defenseIv as number;
    this.model.staminaIv = formModel.staminaIv as number;
    this.model.quickMove = formModel.quickMove as string;
    this.model.chargeMove = formModel.chargeMove as string;
  }

  private filterPokemon(name: string) {
    return this.dataService.getPokedex().filter(pokemon =>
      pokemon[0].toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  private resetForm() {
    this.pokemonForm.reset({
      species: [this.model.name, this.model.species],
      level: this.model.level,
      attackIv: this.model.attackIv,
      defenseIv: this.model.defenseIv,
      staminaIv: this.model.staminaIv,
      quickMove: this.model.quickMove,
      chargeMove: this.model.chargeMove,
    })
  }
}
