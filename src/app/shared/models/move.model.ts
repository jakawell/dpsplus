export class MoveModel {
  public name: string;
  public displayName: string;
  public isLegacy: boolean;
  public isEvent: boolean;
  public type: string;
  public power: number;
  public energy: number;
  public castTime: number;

  constructor(name: string, isLegacy: boolean, isEvent: boolean, type: string, power: number, energy: number, castTime: number) {
    this.name = name;
    this.isLegacy = isLegacy;
    this.isEvent = isEvent;
    this.type = type;
    this.power = power;
    this.energy = energy;
    this.castTime = castTime;

    this.displayName = name + (isLegacy ? ' (L)' : isEvent ? ' (E)' : '');
  }
}
