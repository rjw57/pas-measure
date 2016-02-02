import { lengthUnit } from './reducers/length-units.js';
import {
  showSelectRecordModal, selectedRecordId, recordsById
} from './reducers/record.js';
import { interaction } from './reducers/interaction.js';

import { combineReducers } from 'redux';

import { ADD_SCALE, REMOVE_SCALE } from './actions.js';

// Scales
let nextScaleId = 1;
function scale(state, action) {
  switch(action.type) {
    case ADD_SCALE:
      let { startPoint, endPoint, length } = action;
      return { id: nextScaleId++, startPoint, endPoint, length };
    default:
      return state;
  }
}

function scales(state = [], action) {
  switch(action.type) {
    case ADD_SCALE:
      return [...state, scale(undefined, action)];
    case REMOVE_SCALE:
      return state.filter(s => s.id !== action.id);
    default:
      return state;
  }
}

const app = combineReducers({
  selectedRecordId,
  recordsById,
  showSelectRecordModal,
  interaction,
  scales,
  lengthUnit,
});

export default app;

