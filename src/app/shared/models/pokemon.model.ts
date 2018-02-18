import { MoveModel } from './move.model';
import { DataService } from '../services/data.service';

export class PokemonModel {
  private _species: number;
  public name: string;
  public type1: string;
  public type2: string;
  public attackBase: number;
  public defenseBase: number;
  public staminaBase: number;
  public quickMoves: MoveModel[] = [];
  public chargeMoves: MoveModel[] = [];

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
      this.attackBase = parseInt(data[4]);
      this.defenseBase = parseInt(data[5]);
      this.staminaBase = parseInt(data[6]);

      this.quickMoves = [];
      this.parseMoves(data.slice(7, 21), true); // parse quick moves
      this.parseMoves(data.slice(21, 37), false); // parse charge moves
    });
  }
  get species(): number {
    return this._species;
  }

  get levelMultiplier(): number {
    return this.dataService.getLevelMultiplier(this.level);
  }

  get attack(): number {
    return (this.attackBase + this.attackIv) * this.levelMultiplier;
  }

  get defense(): number {
    return (this.defenseBase + this.defenseIv) * this.levelMultiplier;
  }

  get stamina(): number {
    return (this.staminaBase + this.staminaIv) * this.levelMultiplier;
  }

  get cp(): number {
    return Math.floor(Math.max((this.attack * Math.pow(this.defense, 0.5) * Math.pow(this.stamina, 0.5) * Math.pow(this.levelMultiplier, 2)) / 10, 10));
  }

  get paddedNumber(): string {
    return (this.species < 10 ? '00' + this.species : (this.species < 100) ? '0' + this.species : '' + this.species);
  }

  private parseMoves(rawMoveList: any[], isQuick: boolean) {
    let moveSet: { name: string, code: string }[] = [];
    for (let i = 0; i < rawMoveList.length; i += 2) {
      if (rawMoveList[i + 1] && rawMoveList[i + 1] != 'N/A') {
        moveSet.push({ name: rawMoveList[i + 1], code: rawMoveList[i]});
      }
    }
    let processor = allMoves => {
      let results: MoveModel[] = [];
      for (let fromAll of allMoves.slice(1)) {
        for (let fromSet of moveSet) {
          if (fromSet.name == fromAll[0]) {
            results.push(new MoveModel(fromSet.name, fromSet.code == 'l', fromSet.code == 'e', fromAll[1], parseInt(fromAll[2]), parseInt(fromAll[3]), parseFloat(fromAll[4])));
          }
        }
      }
      if (isQuick) {
        this.quickMoves = results;
        this.quickMove = results[0].displayName;
      }
      else {
        this.chargeMoves = results;
        this.chargeMove = results[0].displayName;
      }
    }
    if (isQuick)
      this.dataService.getQuickMoves(processor);
    else
      this.dataService.getChargeMoves(processor);
  }
}
