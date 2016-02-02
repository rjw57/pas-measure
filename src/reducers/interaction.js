import {
  START_DRAWING_SCALE, STOP_DRAWING_SCALE,
  START_DRAWING_LINE, STOP_DRAWING_LINE,
  START_DRAWING_CIRCLE, STOP_DRAWING_CIRCLE,
} from '../actions.js';

// interaction states
export let NEUTRAL = 'NEUTRAL';
export let DRAWING_SCALE = 'DRAWING_SCALE';
export let DRAWING_LINE = 'DRAWING_LINE';
export let DRAWING_CIRCLE = 'DRAWING_CIRCLE';

const initialInteractionState = {
  state: NEUTRAL, options: null
};

export function interaction(state = initialInteractionState, action) {
  switch(action.type) {
    case START_DRAWING_SCALE:
      let { length } = action.payload;
      return { state: DRAWING_SCALE, options: { length } };
    case STOP_DRAWING_SCALE:
      return initialInteractionState;
    case START_DRAWING_LINE:
      return { state: DRAWING_LINE, options: null };
    case STOP_DRAWING_LINE:
      return initialInteractionState;
    case START_DRAWING_CIRCLE:
      return { state: DRAWING_CIRCLE, options: null };
    case STOP_DRAWING_CIRCLE:
      return initialInteractionState;
    default:
      return state;
  }
}

