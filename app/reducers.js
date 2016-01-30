import { combineReducers } from 'redux'
import {
  REQUEST_SELECT_RECORD, CANCEL_SELECT_RECORD,
  REQUEST_RECORD, RECEIVE_RECORD, SELECT_RECORD,
  START_DRAWING, STARTED_DRAWING, FINISHED_DRAWING,
  UPDATED_DRAWING,

  SCALE
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

/* The editor state consists of what type of object is currently being drawn (or
 * null if there is no current drawing) and a collection of objects. Each object
 * has a geometry property which is an ol.Geometry instance describing the
 * geometry of the drawn object. Each object also has a unique id accessible
 * through the id property.
 */

const initialCurrentlyDrawingState = {
  type: null,
  geometry: null,
};

function currentlyDrawing(state = initialCurrentlyDrawingState, action) {
  switch(action.type) {
    case START_DRAWING:
      return Object.assign({}, state, {
        type: action.drawingType, geometry: null
      });
    case STARTED_DRAWING:
    case UPDATED_DRAWING:
      return Object.assign({}, state, action.drawing);
    case FINISHED_DRAWING:
      return Object.assign({}, state, { type: null, geometry: null });
    default:
      return state;
  }
}

const editor = combineReducers({
  currentlyDrawing
});

const app = combineReducers({
  selectedRecordId,
  recordsById,
  showSelectRecordModal,
  editor,
});

export default app;

