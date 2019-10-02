import { SearchInput } from '../interfaces/searchInput';
import { DataService } from '../services/data.service';
import { TypeModel } from './type.model';

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

    const typeList = Array.from(this.dataService.types.values())
      .map((type: TypeModel) => type.name.charAt(0).toUpperCase() + type.name.slice(1).toLowerCase()).sort();
    this.types = [];
    this.typesWithNone = [ 'None' ];
    for (const type of typeList) {
      this.types.push(type);
      this.typesWithNone.push(type);
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

  public serialize() {
    return JSON.stringify({
      code: this.code,
      name: this.name,
      type1: this.type1,
      type2: this.type2,
    });
  }

  public deserialize(source: string) {
    const sourceObj: any = JSON.parse(source);
    if (sourceObj.code) this.code = sourceObj.code;
    if (sourceObj.name) this.name = sourceObj.name;
    if (sourceObj.type1) this.type1 = sourceObj.type1;
    if (sourceObj.type2) this.type2 = sourceObj.type2;
  }
}
