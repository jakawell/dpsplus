import { Injectable } from '@angular/core';
import * as localForage from 'localforage';
import { PokemonModel, TypeInput, WeatherInput } from '../models/';
import { DataService } from './data.service';

@Injectable()
export class StorageService {

  private KEY_LAST_SEARCH_TYPE: string = 'LAST_SEARCH_TYPE';
  private KEY_LAST_DEFENDER: string = 'LAST_DEFENDER';
  private KEY_LAST_TYPE: string = 'LAST_TYPE';
  private KEY_LAST_WEATHER: string = 'LAST_WEATHER';
  private KEY_LAST_ATTACKERS: string = 'LAST_ATTACKERS';
  private KEY_LAST_ATTACKERS_COUNT: string = 'KEY_LAST_ATTACKERS_COUNT';

  constructor(private dataService: DataService) { }

  public getLastSearchType(): Promise<string> {
    return this.getItem<string>(this.KEY_LAST_SEARCH_TYPE, (value: string) => value);
  }

  public setLastSearchType(searchType: string): void {
    this.setItem(this.KEY_LAST_SEARCH_TYPE, searchType);
  }

  public getLastDefender(): Promise<PokemonModel> {
    return this.getItem<PokemonModel>(this.KEY_LAST_DEFENDER, (value: string) => this.deserializePokemonModel(value));
  }

  public setLastDefender(defender: PokemonModel): void {
    this.setItem(this.KEY_LAST_DEFENDER, defender.serialize());
  }

  public getLastTypeInput(): Promise<TypeInput> {
    return this.getItem<TypeInput>(this.KEY_LAST_TYPE, (value: string) => {
      if (!value)
        return null;
      const type = new TypeInput('types', 'Counter Type', this.dataService);
      type.deserialize(value);
      return type;
    });
  }

  public setLastTypeInput(type: TypeInput): void {
    this.setItem(this.KEY_LAST_TYPE, type.serialize());
  }

  public getLastWeatherInput(): Promise<WeatherInput> {
    return this.getItem<WeatherInput>(this.KEY_LAST_WEATHER, (value: string) => {
      if (!value)
        return null;
      const weather = new WeatherInput('weather', 'Weather');
      weather.deserialize(value);
      return weather;
    });
  }

  public setLastWeatherInput(type: WeatherInput): void {
    this.setItem(this.KEY_LAST_WEATHER, type.serialize());
  }

  public getLastCounters(): Promise<PokemonModel[]> {
    return this.getItem<PokemonModel[]>(this.KEY_LAST_ATTACKERS, (value: string) => {
      const result: PokemonModel[] = [];
      if (!value)
        return result;
      const serializedPokemon = value.split('\n');
      for (let serialized of serializedPokemon) {
        result.push(this.deserializePokemonModel(serialized));
      }
      return result;
    });
  }

  public setLastCounters(counters: PokemonModel[]): void {
    let serialized: string = '';
    for (let counter of counters) {
      if (counter)
        serialized += counter.serialize() + '\n';
    }
    serialized = serialized.trim();
    if (serialized)
      this.setItem(this.KEY_LAST_ATTACKERS, serialized);
  }

  public getLastCountersCount(): Promise<number> {
    return this.getItem<number>(this.KEY_LAST_ATTACKERS_COUNT, (value: string) => value ? parseInt(value) : null);
  }

  public setLastCountersCount(count: number): void {
    this.setItem(this.KEY_LAST_ATTACKERS_COUNT, count.toString());
  }

  private deserializePokemonModel(pokemonSerialized: string): PokemonModel {
    if (!pokemonSerialized)
      return null;
    const pokemon: any = JSON.parse(pokemonSerialized);
    const result = new PokemonModel(pokemon.species, this.dataService);
    result.deserialize(pokemonSerialized);
    return result;
  }

  private getItem<T>(key: string, parser?: (value: string) => T, defaultResult?: T): Promise<T> {
    return new Promise<T>((resolve) => {
      localForage.getItem(key)
        .then((value: string) => resolve(parser(value)))
        .catch(() => resolve(defaultResult || null));
    });
  }

  private setItem(key: string, value: string): void {
    localForage.setItem(key, value)
      .catch((err: any) => console.warn('Error saving ' + key + ': ', err));
  }
}
