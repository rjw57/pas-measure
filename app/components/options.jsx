import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import { LENGTH_UNITS } from '../actions.js';

let UnitSelector = props => {
  let onUnitSelected = props.onUnitSelected ? props.onUnitSelected : () => null;
  return (
    <ButtonGroup justified>
      {
        props.units.map((unit, i) => (
          <Button componentClass='div'
                  onClick={() => onUnitSelected(unit)}
                  key={i} active={unit.id === props.selectedUnitId}>
            { unit.shortName }
          </Button>
        ))
      }
    </ButtonGroup>
  );
}

let Options = props => (
  <div>
    <UnitSelector units={LENGTH_UNITS}
                  selectedUnitId={props.lengthUnit.id}
                  onUnitSelected={props.onLengthUnitSelected} />
  </div>
);

export default Options;
