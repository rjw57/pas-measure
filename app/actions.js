export const REQUEST_SELECT_RECORD = 'REQUEST_SELECT_RECORD';
export const CANCEL_SELECT_RECORD = 'CANCEL_SELECT_RECORD';

export function cancelSelectRecord() {
  return { type: CANCEL_SELECT_RECORD };
}

export function requestSelectRecord() {
  return { type: REQUEST_SELECT_RECORD };
}

export const REQUEST_RECORD = 'REQUEST_RECORD';
export const RECEIVE_RECORD = 'RECEIVE_RECORD';
export const SELECT_RECORD = 'SELECT_RECORD';

export function selectRecord(id) {
  return { type: SELECT_RECORD, id };
}

function receiveRecord(record) {
  return { type: RECEIVE_RECORD, id: record.id, record };
}

function requestRecord(id) {
  return { type: REQUEST_RECORD, id };
}

import { fetchRecordById } from './pas-api.js';

function fetchRecord(id) {
  return dispatch => {
    // Inform app that a record is being requested
    dispatch(requestRecord(id));


    // Actually try to fetch the record
    fetchRecordById(id).then(record => {
      // We succeeded!
      dispatch(receiveRecord(record));
    });
  };
}

function shouldFetchRecord(state, id) {
  if(id === null) { return false; }
  if(!state.recordsById || !state.recordsById[id]) { return true; }
  return !state.recordsById[id].isFetching;
}

export function fetchRecordIfNeeded(id) {
  return (dispatch, getState) => {
    if(shouldFetchRecord(getState(), id)) {
      return dispatch(fetchRecord(id));
    }
  }
}
