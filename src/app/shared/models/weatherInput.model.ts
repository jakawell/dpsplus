import { SearchInput } from '../interfaces/searchInput';

export class WeatherInput implements SearchInput {
  public code: string;
  public name: string;
  public value: string;

  constructor(code: string, name: string) {
    this.code = code;
    this.name = name;
    this.value = this.weatherList[0];
  }

  get weatherList(): string[] {
    return [
      'Neutral',
      'Clear/sunny',
      'Partly Cloudy',
      'Cloudy',
      'Fog',
      'Rainy',
      'Snow',
      'Windy',
    ];
  }

  get boostedTypes(): string[] {
    let boostedTypes = [];

    if (this.value === 'Clear/sunny') {
      boostedTypes = ['FIRE', 'GRASS', 'GROUND'];
    } else if (this.value === 'Partly Cloudy') {
      boostedTypes = ['NORMAL', 'ROCK'];
    } else if (this.value === 'Cloudy') {
      boostedTypes = ['FAIRY', 'FIGHTING', 'POISON'];
    } else if (this.value === 'Rainy') {
      boostedTypes = ['WATER', 'ELECTRIC', 'BUG'];
    } else if (this.value === 'Snow') {
      boostedTypes = ['ICE', 'STEEL'];
    } else if (this.value === 'Fog') {
      boostedTypes = ['DARK', 'GHOST'];
    } else if (this.value === 'Windy') {
      boostedTypes = ['DRAGON', 'FLYING', 'PSYCHIC'];
    } else {
      boostedTypes = [];
    }

    return boostedTypes;
  }

  public serialize() {
    return JSON.stringify({
      code: this.code,
      name: this.name,
      value: this.value,
    });
  }

  public deserialize(source: string) {
    const sourceObj: any = JSON.parse(source);
    if (sourceObj.code) this.code = sourceObj.code;
    if (sourceObj.name) this.name = sourceObj.name;
    if (sourceObj.value) this.value = sourceObj.value;
  }
}
