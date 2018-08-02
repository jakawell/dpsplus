import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Papa } from 'ngx-papaparse';

@Injectable()
export class DataService {
  private LevelMultipliers: any[] = null;
  public isLoaded = false;

  private _Pokedex: any[] = null;
  private _PokedexAlpha: any[] = null;
  private _Types: any[] = null;
  private _MovesQuick: any[] = null;
  private _MovesCharge: any[] = null;

  constructor(private http: HttpClient, private papa: Papa) {
    //this.load();
  }

  private loadCsv(reference: any, filePath: string, callback: (reference: any) => any) {
    if (reference) {
      callback(reference);
    }
    else {
      this.http.get(filePath, { responseType: 'text' })
        .subscribe(data => {
          reference = this.papa.parse(data, { skipEmptyLines: true }).data;
          callback(reference);
        });
    }
  }

  load(callback?: () => any) {
    this.loadCsv(this._Pokedex, 'assets/data/pokedex.csv', (pokedex) => {
      this._Pokedex = pokedex;
      this._PokedexAlpha = pokedex.slice(1).sort((a, b) => {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
        return 0;
      })
      this.loadCsv(this.LevelMultipliers, 'assets/data/levels.csv', (levels) => {
        this.LevelMultipliers = levels;
        this.loadCsv(this._Types, 'assets/data/types.csv', (types) => {
          this._Types = types;
          this.loadCsv(this._MovesQuick, 'assets/data/movesquick.csv', (movesQ) => {
            this._MovesQuick = movesQ;
            this.loadCsv(this._MovesCharge, 'assets/data/movescharge.csv', (movesC) => {
              this._MovesCharge = movesC;
              this.isLoaded = true;
              if (callback) callback();
            });
          });
        });
      });
    });
  }

  getPokedex(): any[] {
    return this._Pokedex.slice(1);
  }

  getPokedexAlpha(): any[] {
    return this._PokedexAlpha.slice();
  }

  getPokemon(species: number, form: string): any[] {
    for (let pokemon of this._Pokedex)
      if (pokemon[1] == species && (!form || pokemon[2] == form))
        return pokemon;
    return null;
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
