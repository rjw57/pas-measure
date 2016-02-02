import { fetchRecordById } from '../pas-api.js';

// Selecting records by id, fetching them from finds.org.uk and receiving
// responses from finds.org.uk. Note that receiveRecord, requestRecord and
// fetchRecord are "private" actions.
export const REQUEST_RECORD = 'REQUEST_RECORD';
export const RECEIVE_RECORD = 'RECEIVE_RECORD';
export const SELECT_RECORD = 'SELECT_RECORD';
export let selectRecord = id => ({ type: SELECT_RECORD, id });

let receiveRecord = record => ({ type: RECEIVE_RECORD, id: record.id, record });
let requestRecord = id => ({ type: REQUEST_RECORD, id });

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

// Cause a record to be fetched from the database if a matching record with that
// id is not in the recordsById cache.
export function fetchRecordIfNeeded(id) {
  return (dispatch, getState) => {
    if(shouldFetchRecord(getState(), id)) {
      return dispatch(fetchRecord(id));
    }
  }
}

