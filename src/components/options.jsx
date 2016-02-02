import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

export let UnitSelector = props => {
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
