import { lengthUnit } from './reducers/length-units.js';
import {
  showSelectRecordModal, selectedRecordId, recordsById
} from './reducers/record.js';
import { interaction } from './reducers/interaction.js';

import { combineReducers } from 'redux';

import {
  ADD_SCALE, REMOVE_SCALE, ADD_LINE, REMOVE_LINE
} from './actions.js';

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

// Lines
let nextLineId = 1;
function line(state, action) {
  switch(action.type) {
    case ADD_LINE:
      let { startPoint, endPoint } = action.payload;
      return { id: nextLineId++, startPoint, endPoint };
    default:
      return state;
  }
}

function lines(state = [], action) {
  switch(action.type) {
    case ADD_LINE:
      return [...state, line(undefined, action)];
    case REMOVE_LINE:
      return state.filter(l => l.id !== action.id);
    default:
      return state;
  }
}

const app = combineReducers({
  selectedRecordId,
  recordsById,
  showSelectRecordModal,
  interaction,
  scales, lines,
  lengthUnit,
});

export default app;

