export * from './actions/record-selection.js';
export * from './actions/record-fetching.js';
export * from './actions/length-units.js';

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

// Adding and removing lines to the current drawing.
export const ADD_LINE = 'ADD_LINE';
export const REMOVE_LINE = 'REMOVE_LINE';
export let addLine = (startPoint, endPoint) => ({
  type: ADD_LINE, startPoint, endPoint
});
export let removeLine = lineId => ({ type: REMOVE_LINE, id: lineId });

// Drawing lines
export const START_DRAWING_LINE = 'START_DRAWING_LINE';
export const STOP_DRAWING_LINE = 'STOP_DRAWING_LINE';
export let startDrawingLine = () => ({ type: START_DRAWING_LINE });
export let stopDrawingLine = () => ({ type: STOP_DRAWING_LINE });
