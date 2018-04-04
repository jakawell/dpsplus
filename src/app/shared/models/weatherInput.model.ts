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
      "Neutral",
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
    } else {
      boostedTypes = [];
    }//End if statements

    return boostedTypes
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
