// Request that the user select a new Database record and cancel any selection
// which is in progress.
export const REQUEST_SELECT_RECORD = 'REQUEST_SELECT_RECORD';
export const CANCEL_SELECT_RECORD = 'CANCEL_SELECT_RECORD';
export function cancelSelectRecord() { return { type: CANCEL_SELECT_RECORD }; }
export function requestSelectRecord() { return { type: REQUEST_SELECT_RECORD }; }

// Selecting records by id, fetching them from finds.org.uk and receiving
// responses from finds.org.uk. Note that receiveRecord, requestRecord and
// fetchRecord are "private" actions.
export const REQUEST_RECORD = 'REQUEST_RECORD';
export const RECEIVE_RECORD = 'RECEIVE_RECORD';
export const SELECT_RECORD = 'SELECT_RECORD';
export function selectRecord(id) { return { type: SELECT_RECORD, id }; }
function receiveRecord(record) { return { type: RECEIVE_RECORD, id: record.id, record }; }
function requestRecord(id) { return { type: REQUEST_RECORD, id }; }

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

// Cause a record to be fetched from the database if a matching record with that
// ID is not in the recordsById cache.
export function fetchRecordIfNeeded(id) {
  return (dispatch, getState) => {
    if(shouldFetchRecord(getState(), id)) {
      return dispatch(fetchRecord(id));
    }
  }
}

// Length units which are supported. Each unit has a short name, id
// and a length in metres. setLengthUnit doesn't need to be passed one of these
// objects but they're provided as a convenience.
export const LENGTH_UNITS = [
  { id: 'MM', shortName: 'mm', length: 1e-3 },
  { id: 'CM', shortName: 'cm', length: 1e-2 },
  { id: 'IN', shortName: 'in', length: 2.54e-2 },
];

export const SET_LENGTH_UNIT = 'SET_LENGTH_UNIT';
export function setLengthUnit(unit) { return { type: SET_LENGTH_UNIT, unit }; }

// Adding and removing scales to the current drawing.
export const ADD_SCALE = 'ADD_SCALE';
export const REMOVE_SCALE = 'REMOVE_SCALE';
export function addScale(startPoint, endPoint, length) {
  return {
    type: ADD_SCALE, startPoint, endPoint, length
  };
}
export function removeScale(scaleId) { return { type: REMOVE_SCALE, id: scaleId }; }

// Drawing scales
export const START_DRAWING_SCALE = 'START_DRAWING_SCALE';
export const STOP_DRAWING_SCALE = 'STOP_DRAWING_SCALE';
export let startDrawingScale = length => ({ type: START_DRAWING_SCALE, payload: { length } });
export let stopDrawingScale = () => ({ type: STOP_DRAWING_SCALE });
