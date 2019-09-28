import { Pokemon, PokemonSpecies } from 'pogo-master-import';

export class PokemonModel {
  public basePokemon: Pokemon;

  public raidTier: number;
  public quickMove: string;
  public chargeMove: string;
  public chargeMove2: string;

  public internalId: string;
  public internalTitle: string;
  public isRemovable: boolean;
  public canSelectMoves: boolean;

  public static deserialize(source: string): PokemonModel {
    const sourceObj: any = JSON.parse(source);
    const species = PokemonSpecies.fromParsed(sourceObj.basePokemon.species);
    const model = new PokemonModel(
      species, sourceObj.internalId, sourceObj.internalTitle, sourceObj.isRemovable, sourceObj.canSelectMoves
    );
    model.basePokemon.level = sourceObj.basePokemon.level;
    model.basePokemon.attackIv = sourceObj.basePokemon.attackIv;
    model.basePokemon.defenseIv = sourceObj.basePokemon.defenseIv;
    model.basePokemon.staminaIv = sourceObj.basePokemon.staminaIv;
    model.quickMove = sourceObj.quickMove;
    model.chargeMove = sourceObj.chargeMove;
    model.chargeMove2 = sourceObj.chargeMove2;
    return model;
  }

  constructor(species: PokemonSpecies, internalId?: string, internalTitle?: string, isRemovable?: boolean, canSelectMoves?: boolean) {
    this.setSpecies(species);

    this.internalId = internalId || 'pokemon';
    this.internalTitle = internalTitle || 'Pokémon';
    this.isRemovable = isRemovable || false;
    this.canSelectMoves = canSelectMoves || false;
  }

  get paddedNumber(): string {
    return (this.basePokemon.species.pokedexNumber < 10
      ? '00' + this.basePokemon.species.pokedexNumber
      : (this.basePokemon.species.pokedexNumber < 100)
        ? '0' + this.basePokemon.species.pokedexNumber
        : '' + this.basePokemon.species.pokedexNumber);
  }

  public setSpecies(newSpecies: PokemonSpecies) {
    this.basePokemon = new Pokemon(newSpecies, 30, 15, 15, 15);
    this.quickMove = this.basePokemon.species.fastMoves[0];
    this.chargeMove = this.basePokemon.species.chargeMoves[0];
  }

  public serialize() {
    return JSON.stringify(this);
  }
}
