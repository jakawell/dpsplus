import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { SearchInput, HostPokemonList } from '../../interfaces';
import { PokemonModel } from '../../models';

@Component({
  selector: 'app-pokemon-input',
  templateUrl: './pokemon-input.component.html',
  styleUrls: ['./pokemon-input.component.css']
})
export class PokemonInputComponent implements OnInit {

  public code: string;
  public name: string;
  public value: PokemonModel;
  public isRemovable: boolean;

  public selectorControl: FormControl = new FormControl();
  public filteredPokemon: Observable<any[]>;

  private host: HostPokemonList;

  constructor() { }

  ngOnInit() {
  }

}
