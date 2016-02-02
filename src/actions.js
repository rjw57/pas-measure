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
export let removeScale = scaleId => ({ type: REMOVE_SCALE, id: scaleId });

// Drawing scales
export const START_DRAWING_SCALE = 'START_DRAWING_SCALE';
export const STOP_DRAWING_SCALE = 'STOP_DRAWING_SCALE';
export let startDrawingScale = length => ({
  type: START_DRAWING_SCALE, payload: { length }
});
export let stopDrawingScale = () => ({ type: STOP_DRAWING_SCALE });

// Drawing lines
export const START_DRAWING_LINE = 'START_DRAWING_LINE';
export const STOP_DRAWING_LINE = 'STOP_DRAWING_LINE';
export let startDrawingLine = () => ({ type: START_DRAWING_LINE });
export let stopDrawingLine = () => ({ type: STOP_DRAWING_LINE });

// Drawing circles
export const START_DRAWING_CIRCLE = 'START_DRAWING_CIRCLE';
export const STOP_DRAWING_CIRCLE = 'STOP_DRAWING_CIRCLE';
export let startDrawingCircle = () => ({ type: START_DRAWING_CIRCLE });
export let stopDrawingCircle = () => ({ type: STOP_DRAWING_CIRCLE });

