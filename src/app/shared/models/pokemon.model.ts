import { DataService } from '../services/data.service';

export class PokemonModel {
  private _species: number;
  public name: string;
  public type1: string;
  public type2: string;
  public attackBase: number;
  public defenseBase: number;
  public staminaBase: number;
  public quickMoves: { name: string, isLegacy: boolean }[] = [];
  public chargeMoves: { name: string, isLegacy: boolean }[] = [];

  public level: number;
  public attackIv: number;
  public defenseIv: number;
  public staminaIv: number;
  public quickMove: string;
  public chargeMove: string;

  constructor(species: number, private dataService: DataService) {
    this.species = species;
    this.level = 20;
    this.attackIv = 10;
    this.defenseIv = 10;
    this.staminaIv = 10;
    this.quickMove = 'Tackle';
    this.chargeMove = 'Growl';
  }

  set species(species: number) {
    this._species = species;
    this.dataService.getPokemon(species, data => {
      this.name = data[0];
      this.type1 = data[2];
      this.type2 = data[3] == 'N/A' ? null : data[3];
      this.attackBase = data[4];
      this.defenseBase = data[5];
      this.staminaBase = data[6];

      this.quickMoves = [];
      for (let i = 7; i < 21; i += 2) {
        let moveName = data[i + 1];
        let isMoveLegacy = data[i] == 'l';
        if (moveName != 'N/A') {
          this.quickMoves.push({ name: moveName + (isMoveLegacy ? ' (L)' : ''), isLegacy: isMoveLegacy });
        }
      }

      this.chargeMoves = [];
      for (let i = 21; i < 36; i += 2) {
        let moveName = data[i + 1];
        let isMoveLegacy = data[i] == 'l';
        if (moveName != 'N/A') {
          this.chargeMoves.push({ name: moveName + (isMoveLegacy ? ' (L)' : ''), isLegacy: isMoveLegacy });
        }
      }

      this.quickMove = this.quickMoves[0].name;
      this.chargeMove = this.chargeMoves[0].name;
    });
  }
  get species(): number {
    return this._species;
  }

  get paddedNumber(): string {
    return (this.species < 10 ? '00' + this.species : (this.species < 100) ? '0' + this.species : '' + this.species);
  }
}
