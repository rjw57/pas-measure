// Request that the user select a new Database record and cancel any selection
// which is in progress.
export const REQUEST_SELECT_RECORD = 'REQUEST_SELECT_RECORD';
export const CANCEL_SELECT_RECORD = 'CANCEL_SELECT_RECORD';
export function cancelSelectRecord() { return { type: CANCEL_SELECT_RECORD }; }
export function requestSelectRecord() { return { type: REQUEST_SELECT_RECORD }; }

