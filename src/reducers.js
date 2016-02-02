import { lengthUnit } from './reducers/length-units.js';
import {
  showSelectRecordModal, selectedRecordId, recordsById
} from './reducers/record.js';

import { combineReducers } from 'redux'

import {
  ADD_SCALE, REMOVE_SCALE,
  START_DRAWING_SCALE, STOP_DRAWING_SCALE,

  ADD_LINE, REMOVE_LINE,
  START_DRAWING_LINE, STOP_DRAWING_LINE,
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
      let { startPoint, endPoint, length } = action;
      return { id: nextLineId++, startPoint, endPoint, length };
    default:
      return state;
  }
}

function lines(state = [], action) {
  switch(action.type) {
    case ADD_LINE:
      return [...state, line(undefined, action)];
    case REMOVE_LINE:
      return state.filter(s => s.id !== action.id);
    default:
      return state;
  }
}

const features = combineReducers({ scales, lines });

// interaction states
export let NEUTRAL = 'NEUTRAL';
export let DRAWING_SCALE = 'DRAWING_SCALE';

const initialInteractionState = {
  state: NEUTRAL, options: null
};

function interaction(state = initialInteractionState, action) {
  switch(action.type) {
    case START_DRAWING_SCALE:
      let { length } = action.payload;
      return { state: DRAWING_SCALE, options: { length } }
    case STOP_DRAWING_SCALE:
      return initialInteractionState;
    default:
      return state;
  }
}

const app = combineReducers({
  selectedRecordId,
  recordsById,
  showSelectRecordModal,
  interaction,
  features,
  lengthUnit,
});

export default app;

