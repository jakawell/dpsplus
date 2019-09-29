import { Injectable } from '@angular/core';
import { ImportFromSaved, PokemonSpecies, Move } from 'pogo-objects';
import { TypeModel } from '../models/type.model';
import GameMaster from './master.json';
import Types from './typeChart.json';

@Injectable()
export class DataService {
  private _Species = new Map<string, PokemonSpecies>();
  private _Moves = new Map<string, Move>();
  private _Types = new Map<string, TypeModel>();

  constructor() {
    const { speciesList, movesList } = ImportFromSaved(GameMaster);
    this._Species = speciesList;
    this._Moves = movesList;

    const types = Types as TypeModel[];
    for (const type of types) {
      this._Types.set(type.name, type);
    }
  }

  public get species(): Map<string, PokemonSpecies> {
    return this._Species;
  }

  public get speciesAlphabetical(): Map<string, PokemonSpecies> {
    return new Map([...Array.from(this.species.entries())].sort());
  }

  public get moves(): Map<string, Move> {
    return this._Moves;
  }

  public get types(): Map<string, TypeModel> {
    return this._Types;
  }

  public getSpecies(id: string): PokemonSpecies {
    return this._Species.get(id);
  }

  public getMove(id: string): Move {
    return this._Moves.get(id);
  }

  public getTypeEffectiveness(attackingType: string, defendingType1: string, defendingType2?: string): number {
    const attack = this._Types.get(attackingType);
    const defense1 = this._Types.get(defendingType1);
    const defense2 = defendingType2 ? this._Types.get(defendingType2) : {
      name: 'none',
      strengths: [],
      weaknesses: [],
      immunes: []
    } as TypeModel;

    if (defense1.immunes.includes(attack.name) || defense2.immunes.includes(attack.name) // "No effect" / "Immune"
    ) {
      return 0.39;
    }
    if (attack.weaknesses.includes(defense1.name) && attack.weaknesses.includes(defense2.name)) { // "Doubly not very effective"
      return 0.39;
    }
    if (attack.weaknesses.includes(defense1.name) || attack.weaknesses.includes(defense2.name)) { // "Not very effective"
      return 0.625;
    }
    if (attack.strengths.includes(defense1.name) && attack.strengths.includes(defense2.name)) { // "Doubly effective"
      return 2.56;
    }
    if (attack.strengths.includes(defense1.name) || attack.strengths.includes(defense2.name)) { // "Super effective"
      return 1.6;
    }
    return 1; // "Normally effective"
  }
}
