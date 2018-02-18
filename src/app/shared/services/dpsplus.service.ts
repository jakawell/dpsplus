import { Injectable } from '@angular/core';
import { PokemonModel, SearchTypeModel, MoveModel, PokemonInput, TypeInput, WeatherInput } from '../models';
import { DataService } from './data.service';

@Injectable()
export class DpsPlusService {

  constructor(private dataService: DataService) { }

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

  movesetListDPSPlusPoke(pokemonInput: PokemonInput){
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
}
