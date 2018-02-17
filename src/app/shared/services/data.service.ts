import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as csvParse from 'csv-parse/lib/sync';

@Injectable()
export class DataService {

  private _Pokedex: any[] = null;

  constructor(private http: HttpClient) { }

  private loadPokedex(callback) {
    if (this._Pokedex) {
      callback(this._Pokedex);
    }
    else {
      this.http.get('assets/data/pokedex.csv', { responseType: 'text' })
        .subscribe(data => {
          console.log('loaded pokedex file...')
          this._Pokedex = csvParse(data);
          console.log('loaded pokedex: ', this._Pokedex);
          callback(this._Pokedex);
        });
    }
  }

  getPokedex(callback: (pokedex: any[]) => any) {
    this.loadPokedex(pokedex => callback(pokedex.slice(1, 387)));
  }

  getPokemon(index: number, callback: (pokemon: any[]) => any) {
    this.loadPokedex(pokedex => {
      callback(pokedex[index]);
    });
  }
}
