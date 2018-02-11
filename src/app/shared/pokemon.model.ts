export class PokemonModel {
  public id: number;
  public name: string;
  public level: number;
  public attackIv: number;
  public defenseIv: number;
  public staminaIv: number;
  public quickMove: string;
  public chargeMove: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
    this.level = 20;
    this.attackIv = 10;
    this.defenseIv = 10;
    this.staminaIv = 10;
    this.quickMove = 'Tackle';
    this.chargeMove = 'Growl';
  }

  get paddedNumber(): string {
    return (this.id < 10 ? '00' + this.id : (this.id < 100) ? '0' + this.id : '' + this.id);
  }

  get quickMoveList(): string[] {
    return [ 'Tackle', 'Quick Attack'];
  }

  get chargeMoveList(): string[] {
    return [ 'Growl', 'Bite' ];
  }
}
