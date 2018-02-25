import { Injectable } from '@angular/core';
import { PokemonModel, SearchTypeModel, DpsPlusQueryType, SearchInputType, SearchInputDefinition, SearchResultsColumn, MoveModel, PokemonInput, TypeInput, WeatherInput } from '../models';
import { DataService } from './data.service';

@Injectable()
export class DpsPlusService {

  constructor(private dataService: DataService) { }

  public get SearchTypes(): SearchTypeModel[] {
    return [

      new SearchTypeModel(DpsPlusQueryType.Pokemon, 'Best General Moves', [
        new SearchInputDefinition('pokemon', 'Pokémon', SearchInputType.Pokemon),
      ], [
        new SearchResultsColumn('quickMove0', 'Quick Move', 0),
        new SearchResultsColumn('chargeMove0', 'Charge Move', 1),
        new SearchResultsColumn('dpsPlus0', 'DPS+', 2),
      ]),

      new SearchTypeModel(DpsPlusQueryType.PokemonVsType, 'Best Moves Vs. Type', [
        new SearchInputDefinition('pokemon', 'Pokémon', SearchInputType.Pokemon),
        new SearchInputDefinition('types', 'Counter Type', SearchInputType.Type),
      ], [
        new SearchResultsColumn('quickMove1', 'Quick Move', 0),
        new SearchResultsColumn('chargeMove1', 'Charge Move', 1),
        new SearchResultsColumn('dpsPlus1', 'DPS+', 2),
      ]),

      new SearchTypeModel(DpsPlusQueryType.PokemonVsPokemon, 'Best Moves Vs. Pokémon', [
        new SearchInputDefinition('attacker', 'Attacker', SearchInputType.Pokemon),
        new SearchInputDefinition('defender', 'Defender', SearchInputType.Pokemon),
        new SearchInputDefinition('weather', 'Weather', SearchInputType.Weather),
      ], [
        new SearchResultsColumn('quickMove2', 'Quick Move', 0),
        new SearchResultsColumn('chargeMove2', 'Charge Move', 1),
        new SearchResultsColumn('dpsPlus2', 'DPS+', 2),
      ]),

    ]
  }

  public runQuery(queryType: DpsPlusQueryType, pokemonInputs: PokemonInput[], weatherInputs: WeatherInput[], typeInputs: TypeInput[]): any[] {
    switch (queryType) {
      case DpsPlusQueryType.Pokemon:
        return this.movesetListDPSPlusPoke(pokemonInputs[0]);
      case DpsPlusQueryType.PokemonVsType:
        return this.movesetListDPSPlusPokeVsType(pokemonInputs[0], typeInputs[0]);
      case DpsPlusQueryType.PokemonVsPokemon:
        return this.movesetListDPSPlusPokeVsPoke(pokemonInputs[0], pokemonInputs[1], weatherInputs[0]);
      default:
        throw new Error("Unsupported query type for DpsPlusService.");
    }
  }

  private getSTAB(pokeType1,pokeType2,quickType,chargeType){
    //Input: attacking pokemon type(s) and quick and charge move quickNameTypeStats
    //Output: STAB multipliers

    //Defining STAB multipliers for the quick and charge moves
    let stab = [1, 1];
    //Checking to see if the quick move matches the attacking pokemon type(s)
    if (pokeType1 === quickType){
      stab[0] = 1.2;
    } else if (pokeType2 === quickType){
      stab[0] = 1.2;
    }//End else statement
    //Checking to see if the charge move matches the attacking pokemon type(s)
    if (pokeType1 === chargeType){
      stab[1] = 1.2;
    } else if (pokeType2 === chargeType){
      stab[1] = 1.2;
    }//end else statement
    return stab
  }//End Function

  private movesetPower(quickNameTypeStats: MoveModel,chargeNameTypeStats: MoveModel){
    //Input: one moveset and stab multipliers
    //Output: Power output over charge time cycle for both moves and cycle time

    //Calculating the charge time to use the charge move
    let chargeTime = chargeNameTypeStats.energy*(quickNameTypeStats.castTime/quickNameTypeStats.energy);

    //Calculating the cycle time (charge time + charge move cast time)
    let cycleTime = chargeTime + chargeNameTypeStats.castTime;

    //Calculating the individual DPS+ for the charge and quick moves
    let quickPower = (quickNameTypeStats.power/quickNameTypeStats.castTime)*chargeTime;
    let chargePower = chargeNameTypeStats.power;

    return [quickPower, chargePower, cycleTime]
  }

  private getIndex(type,typemultiplierslist){
    //Input: a type and the list of types and type typemultipliers
    //Output: The index of the type in the first column of the type multipliers
    //matrix. This index includes the first 2 cells in the first column of the type
    //multipliers spreadsheet as they are "filler" and "attacker".
    let index = -1;

    for (let i = 0; i < typemultiplierslist.length; i++){
      if (type === typemultiplierslist[i][0]){
        index = i;
      }//End of if statement
    }//End of for loop
    return index
  }

  private getTypeAdvantageMult(quickType,chargeType,defType1,defType2){
    let typemultiplierslist = this.dataService.getTypes();
    //Input: quick and charge move types, defender type(s), and type multiplier table
    //Output: array of quick and charge type multipliers
    let typeMult = [1, 1];

    //Checking for quick, charge, and first defender type multiplier indices
    let quickIndex = this.getIndex(quickType,typemultiplierslist);
    let chargeIndex = this.getIndex(chargeType,typemultiplierslist);
    //This index has -1 because the length of the storage array is 1 less than the height
    let defenderTypeIndex1 = this.getIndex(defType1,typemultiplierslist)-1;

    //Calculating the quick and charge type bonuses against first defender type
    typeMult[0] = typeMult[0]*typemultiplierslist[quickIndex][defenderTypeIndex1];
    typeMult[1] = typeMult[1]*typemultiplierslist[chargeIndex][defenderTypeIndex1];

    //Calculating the type bonus for the second defender type (if applicable)
    if (defType2 && (defType2 !== "N/A") && (defType2 !== "")){
      let defenderTypeIndex2 = this.getIndex(defType2,typemultiplierslist)-1;

      typeMult[0] = typeMult[0]*typemultiplierslist[quickIndex][defenderTypeIndex2];
      typeMult[1] = typeMult[1]*typemultiplierslist[chargeIndex][defenderTypeIndex2];
    }//End if statement
    return typeMult;
  }

  private getWeatherMult(quickType,chargeType,boostedTypes){
    //Input: two arrays containing the quick and charge moves names, types, and status
    //and the array of the two or three weather boosted types
    //Output: the weather boost multipliers for the quick and charge moves
    var weatherMult = [1, 1];

    for (let i = 0; i < boostedTypes.length; i++){
      if (quickType === boostedTypes[i]){
        weatherMult[0] = 1.2;
      }//End of if statement
      if (chargeType === boostedTypes[i]){
        weatherMult[1] = 1.2;
      }//End of if statement
    }//End of for loop

    return weatherMult
  }

  private movesetListDPSPlusPoke(pokemonInput: PokemonInput): any[] {
    //Input: an array of the pokemon's name, dex number and type(s), two arrays
    //containing the quick and charge moves for the attacking pokemon
    //Output: list of all the movesets with the calculated STAB boosted DPS+, and
    //the number of movesets-1

    let pokemon = pokemonInput.value;

    //Initializing the list of movesets which will contain quick move, charge move, and dps+
    let movesets = [];
    //Storing all possible movesets and calculating and storing dps+
    //Looping over the number of quick moves
    for (let quickMove of pokemon.quickMoves) {
      //Looping over the number of charge movesets
      for (let chargeMove of pokemon.chargeMoves) {
        let moveset = [];
        //Storing the quick and charge moves names in the storage array
        moveset[0] = quickMove.displayName;
        moveset[1] = chargeMove.displayName;

        //Determing the STAB multiplier for the quick and charge moves
        let stab = this.getSTAB(pokemon.type1, pokemon.type2, quickMove.type, chargeMove.type);

        //Calculating the power for the quick and charge moves and the cycle time
        let power = this.movesetPower(quickMove, chargeMove);
        //Calculating the damage output over one cycle for the quick and charge moves
        let quickDamage = stab[0]*power[0];
        let chargeDamage = stab[1]*power[1];

        //Finally calculating DPS+ for the i, j moveset
        moveset[2] = (quickDamage + chargeDamage)/power[2];
        movesets.push(moveset);
      }
    }

    // sort by DPS+
    return movesets.sort((a, b) => {
      if (a[2] > b[2]) return -1;
      else if (a[2] < b[2]) return 1;
      else return 0;
    });
  }//End function

  private movesetListDPSPlusPokeVsType(pokemonInput: PokemonInput, defenseTypes: TypeInput): any[] {
    //Input: an array of the pokemon's name, dex number and type(s), two arrays
    //containing the quick and charge moves for the attacking pokemon, the defender's
    //types (if the defender doesn't have a second type enter ""), the list of all
    //quick and charge moves with their types and stats, and the list of all types
    //and type multipliers
    //Output: list of all the movesets with the calculated STAB boosted, type specific
    //DPS+, and the number of movesets-1

    let pokemon = pokemonInput.value;
    let defType1 = defenseTypes.type1;
    let defType2 = defenseTypes.type2;

    //Initializing the list of movesets which will contain quick move, charge move, and dps+
    var movesets = [];

    //Storing all possible movesets and calculating and storing dps+
    //Looping over the number of quick moves
    for (let quickMove of pokemon.quickMoves) {
      //Looping over the number of charge movesets
      for (let chargeMove of pokemon.chargeMoves) {
        let moveset = [];
        //Storing the quick and charge moves names in the storage array
        moveset[0] = quickMove.displayName;
        moveset[1] = chargeMove.displayName;

        //Determing the STAB multiplier for the quick and charge moves
        let stab = this.getSTAB(pokemon.type1, pokemon.type2, quickMove.type, chargeMove.type);

        //Determind the type advantage multipliers for the quick and charge moves
        let typeMult = this.getTypeAdvantageMult(quickMove.type,chargeMove.type,defType1,defType2);

        //Calculating the power for the quick and charge moves and the cycle time
        let power = this.movesetPower(quickMove,chargeMove);
        //Calculating the damage output over one cycle for the quick and charge moves
        let quickDamage = stab[0]*typeMult[0]*power[0];
        let chargeDamage = stab[1]*typeMult[1]*power[1];

        //Finally calculating DPS+ for the i, j moveset
        moveset[2] = (quickDamage + chargeDamage)/power[2];
        movesets.push(moveset);
      }
    }

    // sort by DPS+
    return movesets.sort((a, b) => {
      if (a[2] > b[2]) return -1;
      else if (a[2] < b[2]) return 1;
      else return 0;
    });
  }//End function

  private movesetListDPSPlusPokeVsPoke(attackerInput: PokemonInput, defenderInput: PokemonInput, weatherInput: WeatherInput): any[] {
    //Input: an array of the pokemon's name, dex number and type(s), two arrays
    //containing the quick and charge moves for the attacking pokemon, the defender's
    //types (if the defender doesn't have a second type enter ""), the attacker's and
    //defender's stats, an array containing the 2 or 3 weather boosted types,the list of all
    //quick and charge moves with their types and stats, and the list of all types
    //and type multipliers
    //Output: list of all the movesets with the calculated STAB boosted, type specific,
    //weather boosted DPS+ using the entire damage formula, and the number of movesets-1

    let pokemon = attackerInput.value;
    let defender = defenderInput.value;

    //Initializing the list of movesets which will contain quick move, charge move, and dps+
    var movesets = [];

    //Storing all possible movesets and calculating and storing dps+
    //Looping over the number of quick moves
    for (let quickMove of pokemon.quickMoves) {
      //Looping over the number of charge movesets
      for (let chargeMove of pokemon.chargeMoves) {
        let moveset = [];
        //Storing the quick and charge moves names in the storage array
        moveset[0] = quickMove.displayName;
        moveset[1] = chargeMove.displayName;

        //Determing the STAB multiplier for the quick and charge moves
        let stab = this.getSTAB(pokemon.type1, pokemon.type2, quickMove.type, chargeMove.type);

        //Determind the type advantage multipliers for the quick and charge moves
        let typeMult = this.getTypeAdvantageMult(quickMove.type,chargeMove.type,defender.type1,defender.type2);

        //Determing the weather multiplier
        let weatherMult = this.getWeatherMult(quickMove.type,chargeMove.type,weatherInput.boostedTypes);

        //Calculating the power for the quick and charge moves and the cycle time
        let power = this.movesetPower(quickMove,chargeMove);
        //Calculating the damage output over one cycle for the quick and charge moves
        let quickDamage = Math.floor(1/2*power[0]*weatherMult[0]*stab[0]*typeMult[0]*(pokemon.attack/defender.defense)) + 1;
        let chargeDamage = Math.floor(1/2*power[1]*weatherMult[1]*stab[1]*typeMult[1]*(pokemon.attack/defender.defense)) + 1;

        //Finally calculating DPS+ for the i, j moveset
        moveset[2] = (quickDamage + chargeDamage)/power[2];
        movesets.push(moveset);
      }
    }

    // sort by DPS+
    return movesets.sort((a, b) => {
      if (a[2] > b[2]) return -1;
      else if (a[2] < b[2]) return 1;
      else return 0;
    });
  }//End function
}
