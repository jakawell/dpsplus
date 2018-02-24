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
      "Partly Cloudy",
      "Cloudy",
      "Fog",
      "Rainy",
      "Snow",
      "Windy",
    ]
  }

  get boostedTypes(): string[] {
    var boostedTypes = [];

    if (this.value === "Clear/sunny"){
      boostedTypes = ["Fire", "Grass", "Ground"];
    } else if (this.value === "Partly Cloudy"){
      boostedTypes = ["Normal", "Rock"];
    } else if (this.value === "Cloudy"){
      boostedTypes = ["Fairy", "Fighting", "Poison"];
    } else if (this.value === "Rainy"){
      boostedTypes = ["Water", "Electric", "Bug"];
    } else if (this.value === "Snow"){
      boostedTypes = ["Ice", "Steel"];
    } else if (this.value === "Fog"){
      boostedTypes = ["Dark", "Ghost"];
    } else if (this.value === "Windy"){
      boostedTypes = ["Dragon", "Flying", "Psychic"];
    }//End if statements

    return boostedTypes
  }
}
