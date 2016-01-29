import { combineReducers } from 'redux'
import {
  REQUEST_SELECT_RECORD, CANCEL_SELECT_RECORD,
  REQUEST_RECORD, RECEIVE_RECORD, SELECT_RECORD,
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

const app = combineReducers({
  selectedRecordId,
  recordsById,
  showSelectRecordModal,
});

export default app;

