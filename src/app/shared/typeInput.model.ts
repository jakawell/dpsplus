import { SearchInput } from './searchInput';

export class TypeInput implements SearchInput {
  public code: string;
  public name: string;

  private _type1: string;
  private _type2: string;

  constructor(code: string, name: string) {
    this.code = code;
    this.name = name;
    this.type1 = this.types[1];
    this.type2 = 'None';
  }

  get value(): { type1: string, type2: string } {
    return { type1: this.type1, type2: this.type2};
  }

  get type1(): string {
    return this._type1;
  }
  set type1(type: string) {
    if (type === 'None') {
      type = null;
    }
    this._type1 = type;
  }

  get type2(): string {
    return this._type2;
  }
  set type2(type: string) {
    if (type === 'None') {
      type = null;
    }
    this._type2 = type;
  }

  get types(): string[] {
    return [
      "Normal",
      "Steel",
      "Grass"
    ]
  }

  get typesWithNone(): string[] {
    return ['None'].concat(this.types);
  }
}
