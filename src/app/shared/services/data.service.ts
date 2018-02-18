import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as csvParse from 'csv-parse/lib/sync';

@Injectable()
export class DataService {
  private LevelMultipliers: any[] = null;
  public isPokedexLoaded = false;

  private _Pokedex: any[] = null;
  private _Types: any[] = null;
  private _MovesQuick: any[] = null;
  private _MovesCharge: any[] = null;

  constructor(private http: HttpClient) {
    this.loadPokedex();
    this.loadCsv(this.LevelMultipliers, 'assets/data/levels.csv', (data) => this.LevelMultipliers = data);
    this.loadCsv(this._Types, 'assets/data/types.csv', (data) => this._Types = data);
    this.loadCsv(this._MovesQuick, 'assets/data/movesquick.csv', (data) => this._MovesQuick = data);
    this.loadCsv(this._MovesCharge, 'assets/data/movescharge.csv', (data) => this._MovesCharge = data);
  }

  private loadCsv(reference: any, filePath: string, callback: (reference: any) => any) {
    if (reference) {
      callback(reference);
    }
    else {
      this.http.get(filePath, { responseType: 'text' })
        .subscribe(data => {
          reference = csvParse(data);
          callback(reference);
        });
    }
  }

  loadPokedex(callback?: (pokedex: any[]) => any) {
    this.loadCsv(this._Pokedex, 'assets/data/pokedex.csv', (data) => {
      this._Pokedex = data;
      this.isPokedexLoaded = true;
      if (callback) callback(this.getPokedex());
    });
  }

  getPokedex(): any[] {
    return this._Pokedex.slice(1, 387);
  }

  getPokemon(index: number): any[] {
    return this._Pokedex[index];
  }

  getLevelMultiplier(level: number): number {
    return this.LevelMultipliers[(level * 2) - 1][1]
  }

  getTypes(): any[] {
    return this._Types;
  }

  getQuickMoves(): any[] {
    return this._MovesQuick.slice(1);
  }

  getChargeMoves(): any[] {
    return this._MovesCharge.slice(1);
  }

  private getMove(name: string, isQuick: boolean): any[] {
    let moves = isQuick ? this._MovesQuick : this._MovesCharge;
    let result = null;
    for (let move of moves) {
      if (move[0] == name) result = move;
    }
    if (result)
      return result;
    else
      throw Error(`The move '${name}' could not be found.'`);
  }

  getQuickMove(name: string, callback): any[] {
    return this.getMove(name, true);
  }

  getChargeMove(name: string, callback): any[] {
    return this.getMove(name, false);
  }
}
