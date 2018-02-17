import { SearchInput } from '../searchInput';

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
      "Clear/sunny",
      "Partly cloudy",
      "Cloudy",
      "Fog",
      "Rainy",
      "Snow",
      "Windy",
    ]
  }
}
