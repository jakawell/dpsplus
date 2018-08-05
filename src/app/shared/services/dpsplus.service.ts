import { Injectable } from '@angular/core';
import { PokemonModel, SearchTypeModel, DpsPlusQueryType, SearchInputType, SearchInputDefinition, SearchResultsColumn, MoveModel, TypeInput, WeatherInput } from '../models';
import { DataService } from './data.service';
import { AppOptions } from '../interfaces';

@Injectable()
export class DpsPlusService {

  constructor(private dataService: DataService) { }

  public get SearchTypes(): SearchTypeModel[] {
    return [
      new SearchTypeModel(DpsPlusQueryType.CountersAll, 'Top Moves', [
        new SearchInputDefinition('weather', 'Weather', SearchInputType.Weather),
        new SearchInputDefinition('attacker', 'Attacker #', SearchInputType.PokemonSet, { min: 0, max: 6, default: 2, addTitle: 'Add Attacker' }),
      ], [
        new SearchResultsColumn('pokemon3', 'Pokémon', 0),
        new SearchResultsColumn('stats3', 'Stats', 6),
        new SearchResultsColumn('quickMove3', 'Quick Move', 2),
        new SearchResultsColumn('chargeMove3', 'Charge Move', 3),
        new SearchResultsColumn('dpsPlus3', 'DPS+', 4),
        new SearchResultsColumn('tank3', 'Tank', 5),
      ]),

      new SearchTypeModel(DpsPlusQueryType.CountersVsType, 'Top Moves Vs. Type', [
        new SearchInputDefinition('types', 'Counter Type', SearchInputType.Type),
        new SearchInputDefinition('weather', 'Weather', SearchInputType.Weather),
        new SearchInputDefinition('attacker', 'Attacker #', SearchInputType.PokemonSet, { min: 0, max: 6, default: 2, addTitle: 'Add Attacker' }),
      ], [
        new SearchResultsColumn('pokemon4', 'Pokémon', 0),
        new SearchResultsColumn('stats4', 'Stats', 6),
        new SearchResultsColumn('quickMove4', 'Quick Move', 2),
        new SearchResultsColumn('chargeMove4', 'Charge Move', 3),
        new SearchResultsColumn('dpsPlus4', 'DPS+', 4),
        new SearchResultsColumn('tank4', 'Tank', 5),
      ]),

      new SearchTypeModel(DpsPlusQueryType.CountersVsPokemon, 'Top Moves Vs. Pokémon', [
        new SearchInputDefinition('defender', 'Defender', SearchInputType.Defender),
        new SearchInputDefinition('weather', 'Weather', SearchInputType.Weather),
        new SearchInputDefinition('attacker', 'Attacker #', SearchInputType.PokemonSet, { min: 0, max: 6, default: 3, addTitle: 'Add Attacker' }),
      ], [
        new SearchResultsColumn('pokemon5', 'Pokémon', 0),
        new SearchResultsColumn('stats5', 'Stats', 6),
        new SearchResultsColumn('quickMove5', 'Quick Move', 2),
        new SearchResultsColumn('chargeMove5', 'Charge Move', 3),
        new SearchResultsColumn('dpsPlus5', 'DPS+', 4),
        new SearchResultsColumn('tank5', 'Tank', 5),
      ]),
    ]
  }

  public runQuery(queryType: DpsPlusQueryType, pokemonInputs: PokemonModel[], weatherInput: WeatherInput, typeInput: TypeInput, appOptions: AppOptions): any[] {
    switch (queryType) {
      case DpsPlusQueryType.CountersAll:
      case DpsPlusQueryType.CountersVsType:
      case DpsPlusQueryType.CountersVsPokemon:
        return this.topCounters(queryType, pokemonInputs, weatherInput, typeInput, appOptions).slice(0, 100);
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

  private getTankiness(atk,def,hp){
    var tank = def*hp/1000;
    return tank
  }

  private movesetPower(quickNameTypeStats: MoveModel,chargeNameTypeStats: MoveModel){
    //Input: one moveset and stab multipliers
    //Output: Power output over charge time cycle for both moves and cycle time

    if (quickNameTypeStats.name == 'Transform') { // transform is a quick move that is irrelevant for DPS and breaks some calculations, so we just return with 0 power
      return [0, 0, 1000];
    }

    //Calculating the charge time to use the charge move
    //The if statement is making sure that if the charge move is a one bar charge move, the user will lose some energy
    //if it is used and the energy gain of the quick move is not a factor of 100. Basically, you will actually use more
    //than 100 energy when using a one bar charge move.
    var chargeTime;
    if (chargeNameTypeStats.energy === 100){
      chargeTime = Math.ceil(chargeNameTypeStats.energy/quickNameTypeStats.energy)*quickNameTypeStats.castTime;
    } else {
      chargeTime = chargeNameTypeStats.energy*(quickNameTypeStats.castTime/quickNameTypeStats.energy);
    }//End If statement

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

  private topCounters(queryType: DpsPlusQueryType, pokemonInputs: PokemonModel[], weatherInput: WeatherInput, typeInput: TypeInput, appOptions: AppOptions): any[] {
    //Initializing the stoarage array of all movesets and the counter for the total
    //number of movesets
    var movesetsCombined = [];

    let attackerSet: PokemonModel[] = [];
    let defenderSet: PokemonModel[] = [];

    for (let pokemonInput of pokemonInputs) {
      if (pokemonInput.internalId.startsWith('attacker')) {
        attackerSet.push(pokemonInput);
      }
      else if (pokemonInput.internalId.startsWith('defender')) {
        defenderSet.push(pokemonInput);
      }
    }

    let defender: PokemonModel = defenderSet.length > 0 ? defenderSet[0] : null;

    if (attackerSet.length > 0) {
      for (let attacker of attackerSet) {
        movesetsCombined = movesetsCombined.concat(this.calculateTopCounter(queryType, attacker, appOptions, defender, typeInput, weatherInput));
      }
    }
    else {
      for (let pokemon of this.dataService.getPokedex()) {
        let selectedPokemon = new PokemonModel(pokemon[1], pokemon[2], this.dataService);
        selectedPokemon.level = 40;
        selectedPokemon.attackIv = 15;
        selectedPokemon.defenseIv = 15;
        selectedPokemon.staminaIv = 15;
        movesetsCombined = movesetsCombined.concat(this.calculateTopCounter(queryType, selectedPokemon, appOptions, defender, typeInput, weatherInput));
      }
    }

    // sort by DPS+
    return movesetsCombined.sort((a, b) => {
      if (a[4] > b[4]) return -1;
      else if (a[4] < b[4]) return 1;
      else return 0;
    });
  }

  private calculateTopCounter(queryType: DpsPlusQueryType, selectedPokemon: PokemonModel, appOptions: AppOptions, defender?: PokemonModel, typeInput?: TypeInput, weatherInput?: WeatherInput): any[] {
    let movesets = [];

    //Storing all possible movesets and calculating and storing dps+
    //Looping over the number of quick moves
    for (let quickMove of selectedPokemon.quickMoves) {
      if ((quickMove.isEvent && !appOptions.showEventMoves) || (quickMove.isLegacy && !appOptions.showLegacyMoves))
        continue;
      //Looping over the number of charge movesets
      for (let chargeMove of selectedPokemon.chargeMoves) {
        if ((chargeMove.isEvent && !appOptions.showEventMoves) || (chargeMove.isLegacy && !appOptions.showLegacyMoves))
          continue;
        let moveset = [];
        //Storing the quick and charge moves names in the storage array
        moveset[0] = selectedPokemon.name;
        moveset[1] = selectedPokemon.type1 + (selectedPokemon.type2 ? ' / ' + selectedPokemon.type2 : '');
        moveset[2] = quickMove.displayName;
        moveset[3] = chargeMove.displayName;

        //Determing the STAB multiplier for the quick and charge moves
        let stab = this.getSTAB(selectedPokemon.type1, selectedPokemon.type2, quickMove.type, chargeMove.type);

        //Determind the type advantage multipliers for the quick and charge moves
        let typeMult = null;
        if (defender) {
          typeMult = this.getTypeAdvantageMult(quickMove.type,chargeMove.type,defender.type1,defender.type2);
        }
        else if (typeInput && typeInput.type1) {
          typeMult = this.getTypeAdvantageMult(quickMove.type,chargeMove.type,typeInput.type1,typeInput.type2);
        }

        //Determing the weather multiplier
        let weatherMult = this.getWeatherMult(quickMove.type,chargeMove.type,weatherInput.boostedTypes);

        //Calculating the power for the quick and charge moves and the cycle time
        let power = this.movesetPower(quickMove,chargeMove);
        //Calculating the damage output over one cycle for the quick and charge moves
        let quickDamage;
        let chargeDamage;
        if (defender) {
          quickDamage = Math.floor(0.5*power[0]*weatherMult[0]*stab[0]*typeMult[0]*(selectedPokemon.attack/defender.defense)) + 1;
          chargeDamage = Math.floor(0.5*power[1]*weatherMult[1]*stab[1]*typeMult[1]*(selectedPokemon.attack/defender.defense)) + 1;
        }
        else {
          quickDamage = stab[0]*weatherMult[0]*power[0]*(typeMult ? typeMult[0] : 1);
          chargeDamage = stab[1]*weatherMult[1]*power[1]*(typeMult ? typeMult[1] : 1);
        }

        //Finally calculating DPS+ for the i, j moveset
        moveset[4] = (quickDamage + chargeDamage)/power[2];
        moveset[5] = this.getTankiness(selectedPokemon.attack, selectedPokemon.defense, selectedPokemon.stamina);
        moveset[6] = `L ${selectedPokemon.level}, ${selectedPokemon.attackIv}/${selectedPokemon.defenseIv}/${selectedPokemon.staminaIv}`;
        movesets.push(moveset);
      }
    }

    // sort by DPS+
    movesets = movesets.sort((a, b) => {
      if (a[4] > b[4]) return -1;
      else if (a[4] < b[4]) return 1;
      else return 0;
    });
    return appOptions.limitTopMovesets ? movesets.slice(0, appOptions.topMovesetDisplayLimit) : movesets;
  }
}
