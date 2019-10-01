import { Injectable } from '@angular/core';
import { Move } from 'pogo-objects';
import { AppOptions } from '../interfaces';
import { DataService } from './data.service';
import { PokemonModel, SearchTypeModel, DpsPlusQueryType, SearchInputType, SearchInputDefinition, SearchResultsColumn, TypeInput, WeatherInput } from '../models';

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
        new SearchResultsColumn('tdpsPercent3', 'DPS+%', 7),
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
        new SearchResultsColumn('tdpsPercent4', 'DPS+%', 7),
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
        new SearchResultsColumn('tdpsPercent5', 'DPS+%', 7),
        new SearchResultsColumn('tank5', 'Tank', 5),
        new SearchResultsColumn('requiredTrainers5', '# Trainers', 8)
      ]),
    ];
  }

  public runQuery(queryType: DpsPlusQueryType, pokemonInputs: PokemonModel[], weatherInput: WeatherInput, typeInput: TypeInput, appOptions: AppOptions): any[] {
    switch (queryType) {
      case DpsPlusQueryType.CountersAll:
      case DpsPlusQueryType.CountersVsType:
      case DpsPlusQueryType.CountersVsPokemon:
        return this.topCounters(queryType, pokemonInputs, weatherInput, typeInput, appOptions).slice(0, 100);
      default:
        throw new Error('Unsupported query type for DpsPlusService.');
    }
  }

  private getSTAB(pokeType1, pokeType2, quickType, chargeType) {
    // Input: attacking pokemon type(s) and quick and charge move quickNameTypeStats
    // Output: STAB multipliers

    // Defining STAB multipliers for the quick and charge moves
    const stab = [1, 1];
    // Checking to see if the quick move matches the attacking pokemon type(s)
    if (pokeType1 === quickType) {
      stab[0] = 1.2;
    } else if (pokeType2 === quickType) {
      stab[0] = 1.2;
    }// End else statement
    // Checking to see if the charge move matches the attacking pokemon type(s)
    if (pokeType1 === chargeType) {
      stab[1] = 1.2;
    } else if (pokeType2 === chargeType) {
      stab[1] = 1.2;
    }// end else statement
    return stab;
  }// End Function

  private getTankiness(atk, def, hp) {
    const tank = def * hp / 1000;
    return tank;
  }

  private movesetPower(quickNameTypeStats: Move, chargeNameTypeStats: Move) {
    // Input: one moveset and stab multipliers
    // Output: Power output over charge time cycle for both moves and cycle time

    if (quickNameTypeStats.name === 'Transform') { // transform is a quick move that is irrelevant for DPS and breaks some calculations, so we just return with 0 power
      return [0, 0, 1000, 1000, 0];
    }

    // Calculating the charge time to use the charge move
    // The if statement is making sure that if the charge move is a one bar charge move, the user will lose some energy
    // if it is used and the energy gain of the quick move is not a factor of 100. Basically, you will actually use more
    // than 100 energy when using a one bar charge move.
    const chargeEnergy = (chargeNameTypeStats.pveStats.energyDelta || 0) * -1;
    const quickEnergy = (quickNameTypeStats.pveStats.energyDelta || 1);
    const quickCastTime = quickNameTypeStats.pveStats.castTime / 1000; // in seconds
    let chargeTime;
    if (chargeEnergy === 100) {
      chargeTime = Math.ceil(chargeEnergy / quickEnergy) * quickCastTime;
    } else {
      chargeTime = chargeEnergy * (quickCastTime / quickEnergy);
    }// End If statement

    // Calculating the cycle time (charge time + charge move cast time)
    const cycleTime = chargeTime + (chargeNameTypeStats.pveStats.castTime / 1000); // in seconds

    // Calculating the individual DPS+ for the charge and quick moves
    const quickPower = (quickNameTypeStats.pveStats.power || 0);
    const chargePower = (chargeNameTypeStats.pveStats.power || 0);
    const quickCT = quickCastTime;

    return [quickPower, chargePower, cycleTime, quickCT, chargeTime];
  }

  private getTypeAdvantageMult(quickType, chargeType, defType1, defType2) {
    // Input: quick and charge move types, defender type(s), and type multiplier table
    // Output: array of quick and charge type multipliers
    return [
      this.dataService.getTypeEffectiveness(quickType, defType1, defType2),
      this.dataService.getTypeEffectiveness(chargeType, defType1, defType2)
    ];
  }

  private getWeatherMult(quickType, chargeType, boostedTypes) {
    // Input: two arrays containing the quick and charge moves names, types, and status
    // and the array of the two or three weather boosted types
    // Output: the weather boost multipliers for the quick and charge moves
    const weatherMult = [1, 1];

    for (let i = 0; i < boostedTypes.length; i++) {
      if (quickType === boostedTypes[i]) {
        weatherMult[0] = 1.2;
      }// End of if statement
      if (chargeType === boostedTypes[i]) {
        weatherMult[1] = 1.2;
      }// End of if statement
    }// End of for loop

    return weatherMult;
  }

  private getTrainers2Win(raidT, dps, realism_factor) {
    // Input: raid tier, moveset DPS, realism factor to account for time after
    // Pokemon faints, lag, etc. (0: worst case, 1: ideal battle)
    // Ouput: Number of trainers required to beat raid boss if all having same pokemon

    let raidTime = 0;
    let defHP = 0;

    if (raidT === 6) {
      defHP = 18750;
      raidTime = 300;
    } else if (raidT === 5) {
      defHP = 12500;
      raidTime = 300;
    } else if (raidT === 4) {
      defHP = 7500;
      raidTime = 180;
    } else if (raidT === 3) {
      defHP = 3000;
      raidTime = 180;
    } else if (raidT === 2) {
      defHP = 1800;
      raidTime = 180;
    } else if (raidT === 1) {
      defHP = 600;
      raidTime = 180;
    }
    const trainers2win = defHP / dps / (raidTime * realism_factor);

    return trainers2win;
  }

  private topCounters(queryType: DpsPlusQueryType, pokemonInputs: PokemonModel[], weatherInput: WeatherInput, typeInput: TypeInput, appOptions: AppOptions): any[] {
    // Initializing the stoarage array of all movesets and the counter for the total number of movesets
    let movesetsCombined = [];

    const attackerSet: PokemonModel[] = [];
    const defenderSet: PokemonModel[] = [];

    for (const pokemonInput of pokemonInputs) {
      if (pokemonInput.internalId.startsWith('attacker')) {
        attackerSet.push(pokemonInput);
      } else if (pokemonInput.internalId.startsWith('defender')) {
        defenderSet.push(pokemonInput);
      }
    }

    const defender: PokemonModel = defenderSet.length > 0 ? defenderSet[0] : null;

    if (attackerSet.length > 0) {
      if (attackerSet.length === 1) {
        appOptions = Object.assign({}, appOptions);
        appOptions.limitTopMovesets = false;
      }
      for (const attacker of attackerSet) {
        movesetsCombined = movesetsCombined.concat(this.calculateTopCounter(queryType, attacker, appOptions, defender, typeInput, weatherInput));
      }
    } else {
      for (const species of Array.from(this.dataService.species.values())) {
        if (!appOptions.showDeoxysAttack && species.speciesId === 'DEOXYS' && species.form === 'ATTACK') {
          continue;
        }
        const selectedPokemon = new PokemonModel(species);
        selectedPokemon.basePokemon.level = 40;
        selectedPokemon.basePokemon.attackIv = 15;
        selectedPokemon.basePokemon.defenseIv = 15;
        selectedPokemon.basePokemon.staminaIv = 15;
        movesetsCombined = movesetsCombined.concat(this.calculateTopCounter(queryType, selectedPokemon, appOptions, defender, typeInput, weatherInput));
      }
    }

    const movesetsFiltered = movesetsCombined.filter(elem => !Number.isNaN(elem[4]));
    if (movesetsFiltered.length !== movesetsCombined.length) {
      const nanDps = movesetsCombined.filter(elem => Number.isNaN(elem[4]));
      console.error('There are movesets with a DPS+ of NaN. Example:', nanDps[0]);
    }

    //  sort by DPS+
    const movesetsSorted =  movesetsFiltered.sort((a, b) => {
      if (a[4] > b[4]) return -1;
      else if (a[4] < b[4]) return 1;
      else return 0;
    });

    if (appOptions.showPercentMaxDps && movesetsSorted.length > 0) {
      const top = movesetsSorted[0][4];
      for (const moveset of movesetsSorted) {
        moveset[7] = moveset[4] / top;
      }
    }

    return movesetsSorted;
  }

  private calculateTopCounter(queryType: DpsPlusQueryType, selectedPokemon: PokemonModel, appOptions: AppOptions, defender?: PokemonModel, typeInput?: TypeInput, weatherInput?: WeatherInput): any[] {
    let movesets = [];
    const selectedSpecies = selectedPokemon.basePokemon.species;

    // Storing all possible movesets and calculating and storing dps+
    // Looping over the number of quick moves
    if (selectedSpecies.fastMoves && selectedSpecies.fastMoves.length > 0
      && selectedSpecies.chargeMoves && selectedSpecies.chargeMoves.length > 0) {
      for (const quickMoveId of selectedSpecies.fastMoves) {
        const quickMove = this.dataService.getMove(quickMoveId);
        if (quickMove.isLegacy && !appOptions.showLegacyMoves)
          continue;
        // Looping over the number of charge movesets
        for (const chargeMoveId of selectedSpecies.chargeMoves) {
          const chargeMove = this.dataService.getMove(chargeMoveId);
          if (chargeMove.isLegacy && !appOptions.showLegacyMoves)
            continue;
          const moveset = [];
          // Storing the quick and charge moves names in the storage array
          moveset[0] = selectedSpecies.speciesName;
          moveset[1] = selectedSpecies.types[0] + (selectedSpecies.types[1] ? ' / ' + selectedSpecies.types[1] : '');
          moveset[2] = quickMove.name;
          moveset[3] = chargeMove.name;

          // Determing the STAB multiplier for the quick and charge moves
          const stab = this.getSTAB(selectedSpecies.types[0], selectedSpecies.types[1], quickMove.type, chargeMove.type);

          // Determind the type advantage multipliers for the quick and charge moves
          let typeMult = null;
          if (defender) {
            typeMult = this.getTypeAdvantageMult(quickMove.type, chargeMove.type, defender.basePokemon.species.types[0], defender.basePokemon.species.types[1]);
          } else if (typeInput && typeInput.type1) {
            typeMult = this.getTypeAdvantageMult(quickMove.type, chargeMove.type, typeInput.type1.toUpperCase(), typeInput.type2 ? typeInput.type2.toUpperCase() : null);
          }

          // Determing the weather multiplier
          const weatherMult = this.getWeatherMult(quickMove.type, chargeMove.type, weatherInput.boostedTypes);

          // Calculating the power for the quick and charge moves and the cycle time
          const power = this.movesetPower(quickMove, chargeMove);
          // Calculating the damage output over one cycle for the quick and charge moves
          const quickDamage = Math.floor(0.5 * stab[0] * weatherMult[0] * power[0] * (typeMult ? typeMult[0] : 1) * (selectedPokemon.basePokemon.attack / (defender ? defender.basePokemon.defense : 100))) + 1;
          const chargeDamage = Math.floor(0.5 * stab[1] * weatherMult[1] * power[1] * (typeMult ? typeMult[1] : 1) * (selectedPokemon.basePokemon.attack / (defender ? defender.basePokemon.defense : 100))) + 1;

          // Finally calculating DPS+ for the i, j moveset
          moveset[4] = (quickDamage * (power[4] / power[3]) + chargeDamage) / power[2];
          moveset[5] = this.getTankiness(selectedPokemon.basePokemon.attack, selectedPokemon.basePokemon.defense, selectedPokemon.basePokemon.stamina);
          moveset[6] = `L ${selectedPokemon.basePokemon.level}, ${selectedPokemon.basePokemon.attackIv}/${selectedPokemon.basePokemon.defenseIv}/${selectedPokemon.basePokemon.staminaIv}`;
          moveset[7] = null; //  placeholder for the Percentage of Top DPS+
          if (defender) {
            moveset[8] = this.getTrainers2Win(defender.raidTier, moveset[4], 0.9);
          }
          movesets.push(moveset);
        }
      }
    }

    //  sort by DPS+
    movesets = movesets.sort((a, b) => {
      if (a[4] > b[4]) return -1;
      else if (a[4] < b[4]) return 1;
      else return 0;
    });
    return appOptions.limitTopMovesets ? movesets.slice(0, appOptions.topMovesetDisplayLimit) : movesets;
  }
}
