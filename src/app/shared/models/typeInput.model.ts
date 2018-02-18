import { SearchInput } from '../searchInput';
import { DataService } from '../services/data.service';

export class TypeInput implements SearchInput {
  public code: string;
  public name: string;
  public types: string[] = [];
  public typesWithNone: string[] = [];

  private _type1: string;
  private _type2: string;

  constructor(code: string, name: string, private dataService: DataService) {
    this.code = code;
    this.name = name;

    let typeList = this.dataService.getTypes();
    this.types = [];
    this.typesWithNone = [ 'None' ];
    for (let typeRow of typeList.splice(2,19)) {
      this.types.push(typeRow[0]);
      this.typesWithNone.push(typeRow[0]);
    }

    this.type1 = this.types[0];
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
}
