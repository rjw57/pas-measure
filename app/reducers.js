import { combineReducers } from 'redux'
import {
  REQUEST_SELECT_RECORD, CANCEL_SELECT_RECORD,

  REQUEST_RECORD, RECEIVE_RECORD, SELECT_RECORD,

  SET_LENGTH_UNIT, LENGTH_UNITS,

  ADD_SCALE, REMOVE_SCALE,
  START_DRAWING_SCALE, STOP_DRAWING_SCALE,

  ADD_LINE, REMOVE_LINE,
  START_DRAWING_LINE, STOP_DRAWING_LINE,
} from './actions.js';

function selectedRecordId(state = null, action) {
  switch(action.type) {
    case SELECT_RECORD:
      return action.id;
    default:
      return state;
  }
}

const initialRecordState = {
  isFetching: false,
  record: null,
};

function record(state = initialRecordState, action) {
  switch(action.type) {
    case REQUEST_RECORD:
      return Object.assign({}, state, {
        isFetching: true, record: null
      });
    case RECEIVE_RECORD:
      return Object.assign({}, state, {
        isFetching: false, record: action.record
      });
    default:
      return state;
  }
}

function recordsById(state = {}, action) {
  switch(action.type) {
    case RECEIVE_RECORD:
    case REQUEST_RECORD:
      return Object.assign({}, state, {
        [action.id]: record(state[action.id], action),
      });
    default:
      return state;
  }
}

function showSelectRecordModal(state = false, action) {
  switch(action.type) {
    case REQUEST_SELECT_RECORD:
      return true;
    case CANCEL_SELECT_RECORD:
      return false;
    default:
      return state;
  }
}

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

const features = combineReducers({
  scales, lines,
});

function lengthUnit(state = LENGTH_UNITS[0], action) {
  switch(action.type) {
    case SET_LENGTH_UNIT:
      return action.unit;
    default:
      return state;
  }
}

const options = combineReducers({
  lengthUnit,
});

const initialScaleInteractionState = { isDrawing: false, length: null };

function scaleInteraction(state = initialScaleInteractionState, action) {
  switch(action.type) {
    case START_DRAWING_SCALE:
      let { length } = action.payload;
      return Object.assign({}, state, { isDrawing: true, length });
    case STOP_DRAWING_SCALE:
      return Object.assign({}, state, { isDrawing: false, length: null });
    default:
      return state;
  }
}

const initialLineInteractionState = { isDrawing: false };

function lineInteraction(state = initialLineInteractionState, action) {
  switch(action.type) {
    case START_DRAWING_LINE:
      let { length } = action.payload;
      return Object.assign({}, state, { isDrawing: true });
    case STOP_DRAWING_LINE:
      return Object.assign({}, state, { isDrawing: false });
    default:
      return state;
  }
}

const interactions = combineReducers({
  scale: scaleInteraction,
  line: lineInteraction,
});

const app = combineReducers({
  selectedRecordId,
  recordsById,
  showSelectRecordModal,
  interactions,
  features,
  options,
});

export default app;

