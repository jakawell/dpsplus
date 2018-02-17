export class SearchTypeModel {
  public id: number;
  public code: string;
  public displayName: string;

  constructor(id: number, code: string, displayName: string) {
    this.id = id;
    this.code = code;
    this.displayName = displayName;
  }
}
