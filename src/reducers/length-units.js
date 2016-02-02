import { SET_LENGTH_UNIT, LENGTH_UNITS } from '../actions/length-units.js';

export function lengthUnit(state = LENGTH_UNITS[0], action) {
  switch(action.type) {
    case SET_LENGTH_UNIT:
      return action.unit;
    default:
      return state;
  }
}
