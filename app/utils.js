import numeral from 'numeral';

// Format a langth and associated unit to be human friendly. Does not append the
// unit.
export function formatLength(length, unit) {
  let lengthInUnits = length / unit.length;
  return numeral(lengthInUnits).format('0.[00]');
}
