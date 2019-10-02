import { Injectable } from '@angular/core';
import * as localForage from 'localforage';
import { AppOptions } from '../interfaces';
import { DataService } from './data.service';
import { PokemonModel } from '../models/pokemon.model';
import { TypeInput } from '../models/typeInput.model';
import { WeatherInput } from '../models/weatherInput.model';

@Injectable()
export class StorageService {

  private KEY_LAST_SEARCH_TYPE = 'LAST_SEARCH_TYPE';
  private KEY_LAST_DEFENDER = 'LAST_DEFENDER';
  private KEY_LAST_TYPE = 'LAST_TYPE';
  private KEY_LAST_WEATHER = 'LAST_WEATHER';
  private KEY_LAST_ATTACKERS = 'LAST_ATTACKERS';
  private KEY_LAST_ATTACKERS_COUNT = 'KEY_LAST_ATTACKERS_COUNT';
  private KEY_APP_OPTIONS = 'KEY_APP_OPTIONS';

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
      for (const serialized of serializedPokemon) {
        result.push(this.deserializePokemonModel(serialized));
      }
      return result;
    });
  }

  public setLastCounters(counters: PokemonModel[]): void {
    let serialized = '';
    for (const counter of counters) {
      if (counter)
        serialized += counter.serialize() + '\n';
    }
    serialized = serialized.trim();
    if (serialized)
      this.setItem(this.KEY_LAST_ATTACKERS, serialized);
  }

  public getLastCountersCount(): Promise<number> {
    return this.getItem<number>(this.KEY_LAST_ATTACKERS_COUNT, (value: string) => value ? parseInt(value, 10) : null);
  }

  public setLastCountersCount(count: number): void {
    this.setItem(this.KEY_LAST_ATTACKERS_COUNT, count.toString());
  }

  public getAppOptions(defaultOptions: AppOptions): Promise<AppOptions> {
    return this.getItem<AppOptions>(this.KEY_APP_OPTIONS, (value: string) => value ? (Object.assign(defaultOptions, JSON.parse(value))) as AppOptions : defaultOptions);
  }

  public setAppOptions(appOptions: AppOptions): void {
    this.setItem(this.KEY_APP_OPTIONS, JSON.stringify(appOptions));
  }

  private deserializePokemonModel(pokemonSerialized: string): PokemonModel {
    if (!pokemonSerialized)
      return null;
    return PokemonModel.deserialize(pokemonSerialized);
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
