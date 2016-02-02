// Length units which are supported. Each unit has a short name, id
// and a length in metres. setLengthUnit doesn't need to be passed one of these
// objects but they're provided as a convenience.
export const LENGTH_UNITS = [
  { id: 'MM', shortName: 'mm', length: 1e-3 },
  { id: 'CM', shortName: 'cm', length: 1e-2 },
  { id: 'IN', shortName: 'in', length: 2.54e-2 },
];

export const SET_LENGTH_UNIT = 'SET_LENGTH_UNIT';
export let setLengthUnit = unit => ({ type: SET_LENGTH_UNIT, unit });

