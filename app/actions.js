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

// Things one may draw
export const SCALE = 'SCALE';

export const START_DRAWING = 'START_DRAWING';
export const STARTED_DRAWING = 'STARTED_DRAWING';
export const UPDATED_DRAWING = 'UPDATED_DRAWING';
export const FINISHED_DRAWING = 'FINISHED_DRAWING';

export function startDrawing(type, properties) {
  return { type: START_DRAWING, drawingType: type, properties };
}

export function startedDrawing(drawing) {
  return { type: STARTED_DRAWING, drawing };
}

export function updatedDrawing(drawing) {
  return { type: UPDATED_DRAWING, drawing };
}

export function finishedDrawing(drawing) {
  return { type: FINISHED_DRAWING, drawing };
}

// Length units which are supported. Each unit has a short name, id
// and a length in metres.
export const LENGTH_UNITS = [
  { id: 'mm', shortName: 'mm', length: 1e-3 },
  { id: 'cm', shortName: 'cm', length: 1e-2 },
  { id: 'in', shortName: 'in', length: 2.54e-2 },
];

export const SET_LENGTH_UNIT = 'SET_LENGTH_UNIT';
export function setLengthUnit(unit) {
  return { type: SET_LENGTH_UNIT, unit };
}

export const ADD_SCALE = 'ADD_SCALE';
export const REMOVE_SCALE = 'REMOVE_SCALE';

export function addScale(startPoint, endPoint, length) {
  return {
    type: ADD_SCALE, startPoint, endPoint, length
  };
}

export function removeScale(scaleId) {
  return { type: REMOVE_SCALE, id: scaleId };
}
