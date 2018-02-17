import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as csvParse from 'csv-parse/lib/sync';

@Injectable()
export class DataService {

  private _Pokedex: any[] = null;
  private _Levels: any[] = null;
  private _Types: any[] = null;
  private _MovesQuick: any[] = null;
  private _MovesCharge: any[] = null;

  constructor(private http: HttpClient) { }

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

  private loadPokedex(callback) {
    this.loadCsv(this._Pokedex, 'assets/data/pokedex.csv', callback);
  }

  private loadLevels(callback) {
    this.loadCsv(this._Levels, 'assets/data/levels.csv', callback);
  }

  private loadTypes(callback) {
    this.loadCsv(this._Types, 'assets/data/types.csv', callback);
  }

  private loadQuickMoves(callback) {
    this.loadCsv(this._MovesQuick, 'assets/data/movesquick.csv', callback);
  }

  private loadChargeMoves(callback) {
    this.loadCsv(this._MovesCharge, 'assets/data/movescharge.csv', callback);
  }

  getPokedex(callback: (pokedex: any[]) => any) {
    this.loadPokedex(pokedex => callback(pokedex.slice(1, 387)));
  }

  getPokemon(index: number, callback: (pokemon: any[]) => any) {
    this.loadPokedex(pokedex => {
      callback(pokedex[index]);
    });
  }

  getLevelMultiplier(level: number, callback) {
    this.loadLevels(levels => {
      callback(levels[(level * 2) - 1][1]);
    });
  }

  getTypes(callback) {
    this.loadTypes(callback);
  }

  getQuickMoves(callback) {
    this.loadQuickMoves(callback);
  }

  getChargeMoves(callback) {
    this.loadChargeMoves(callback);
  }

  private getMove(name: string, isQuick: boolean, callback) {
    let loader = isQuick ? this.loadQuickMoves : this.loadChargeMoves;
    loader(moves => {
      let result = null;
      for (let move of moves) {
        if (move[0] == name) result = move;
      }
      if (result)
        callback(result);
      else
        throw Error(`The move '${name}' could not be found.'`);
    });
  }

  getQuickMove(name: string, callback) {
    this.getMove(name, true, callback);
  }

  getChargeMove(name: string, callback) {
    this.getMove(name, false, callback);
  }
}
