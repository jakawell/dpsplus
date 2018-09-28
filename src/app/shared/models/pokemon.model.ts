import { MoveModel } from './move.model';
import { DataService } from '../services/data.service';

export class PokemonModel {
  private _species: number;
  private _form: string;
  public name: string;
  public raidTier: number;
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

  public internalId: string;
  public internalTitle: string;
  public isRemovable: boolean;
  public canSelectMoves: boolean;

  constructor(species: number, form: string, private dataService: DataService, internalId?: string, internalTitle?: string, isRemovable?: boolean, canSelectMoves?: boolean) {
    this.changeSpecies(species, form);
    this.level = 30;
    this.attackIv = 15;
    this.defenseIv = 15;
    this.staminaIv = 15;
    this.quickMove = 'Tackle';
    this.chargeMove = 'Growl';

    this.internalId = internalId || 'pokemon';
    this.internalTitle = internalTitle || 'Pokémon';
    this.isRemovable = isRemovable || false;
    this.canSelectMoves = canSelectMoves || false;
  }

  get species(): number {
    return this._species;
  }

  get form(): string {
    return this._form;
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

  public changeSpecies(species: number, form: string) {
    this._species = species;
    this._form = form;
    let pokedexData = this.dataService.getPokemon(species, form);
    this.name = pokedexData[0];
    this.raidTier = pokedexData[3];
    this.type1 = pokedexData[4];
    this.type2 = (pokedexData[5] && pokedexData[5] != 'N/A') ? pokedexData[5] : null;
    this.attackBase = parseInt(pokedexData[6]);
    this.defenseBase = parseInt(pokedexData[7]);
    this.staminaBase = parseInt(pokedexData[8]);

    if (this._species == 151) { // darn you mew. y u break all the things.
      const mewQuick = [ "c",
        "Pound", "c",
        "Steel Wing", "c",
        "Charge Beam", "c",
        "Shadow Claw", "c",
        "Volt Switch", "c",
        "Struggle Bug", "c",
        "Frost Breath", "c",
        "Dragon Tail", "c",
        "Infestation", "c",
        "Poison Jab", "c",
        "Rock Smash", "c",
        "Snarl", "c",
        "Cut",
      ];
      const mewCharge = [ "c",
        "Blizzard", "c",
        "Earthquake", "c",
        "Psychic", "c",
        "Focus Blast", "c",
        "Thunder", "c",
        "Fire Blast", "c",
        "Hyper Beam", "c",
        "Solar Beam", "c",
        "Ancient Power", "c",
        "Dragon Claw", "c",
        "Psyshock", "c",
        "Ice Beam", "c",
        "Thunderbolt", "c",
        "Flame Charge", "c",
        "Low Sweep", "c",
        "Overheat", "c",
        "Energy Ball", "c",
        "Gyro Ball", "c",
        "Bulldoze", "c",
        "Rock Slide", "c",
        "Grass Knot", "c",
        "Flash Cannon", "c",
        "Wild Charge", "c",
        "Dark Pulse", "c",
        "Dazzling Gleam",
        "l", "Hurricane", "l",
        "Dragon Pulse",
      ];
      this.parseMoves(mewQuick, true); // parse quick moves
      this.parseMoves(mewCharge, false); // parse charge moves
    }
    else {
      this.parseMoves(pokedexData.slice(9, 23), true); // parse quick moves
      this.parseMoves(pokedexData.slice(23, 39), false); // parse charge moves
    }
  }

  public serialize() {
    return JSON.stringify({
      species: this.species,
      form: this.form,
      level: this.level,
      attackIv: this.attackIv,
      defenseIv: this.defenseIv,
      staminaIv: this.staminaIv,
      quickMove: this.quickMove,
      chargeMove: this.chargeMove,

      internalId: this.internalId,
      internalTitle: this.internalTitle,
      isRemovable: this.isRemovable,
      canSelectMoves: this.canSelectMoves,
    });
  }

  public deserialize(source: string) {
    const sourceObj: any = JSON.parse(source);
    if (sourceObj.species) {
      this.changeSpecies(sourceObj.species, sourceObj.form);
    }
    if (sourceObj.level) this.level = sourceObj.level;
    if (sourceObj.attackIv) this.attackIv = sourceObj.attackIv;
    if (sourceObj.defenseIv) this.defenseIv = sourceObj.defenseIv;
    if (sourceObj.staminaIv) this.staminaIv = sourceObj.staminaIv;
    if (sourceObj.quickMove) this.quickMove = sourceObj.quickMove;
    if (sourceObj.chargeMove) this.chargeMove = sourceObj.chargeMove;
    if (sourceObj.internalId) this.internalId = sourceObj.internalId;
    if (sourceObj.internalTitle) this.internalTitle = sourceObj.internalTitle;
    if (sourceObj.isRemovable) this.isRemovable = sourceObj.isRemovable;
    if (sourceObj.canSelectMoves) this.canSelectMoves = sourceObj.canSelectMoves;
  }

  private parseMoves(rawMoveList: any[], isQuick: boolean) {
    let moveSet: { name: string, code: string }[] = [];
    for (let i = 0; i < rawMoveList.length; i += 2) {
      if (rawMoveList[i + 1] && rawMoveList[i + 1] != 'N/A') {
        moveSet.push({ name: rawMoveList[i + 1], code: rawMoveList[i]});
      }
    }
    let allMoves = isQuick ? this.dataService.getQuickMoves() : this.dataService.getChargeMoves();
    let results: MoveModel[] = [];
    for (let fromAll of allMoves) {
      for (let fromSet of moveSet) {
        if (fromSet.name == fromAll[0]) {
          results.push(new MoveModel(fromSet.name, fromSet.code == 'l', fromSet.code == 'e', fromAll[1], parseInt(fromAll[2]), parseInt(fromAll[3]), parseFloat(fromAll[4])));
          break;
        }
      }
    }
    if (results.length != moveSet.length) {
      console.warn('Some moves are missing.', results, moveSet);
      for (let move of moveSet) {
          let found = false;
          for (let result of results) {
            if (result.name == move.name) {
              found = true;
              break;
            }
          }
          let duplicateCount = 0;
          for (let move2 of moveSet) {
            if (move2.name == move.name)
              duplicateCount++;
          }
          if (!found)
            console.warn('Missing ' + move.name);
          if (duplicateCount > 1)
            console.warn('Duplicate move ' + move.name);
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
}
