import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';

import { formatLength } from '../utils.js';

function formatScalePixelLength(scale) {
  // Fake "pixel" unit
  let unit = { id: 'px', shortName: 'px', length: 1 };
  let dx = scale.endPoint[0] - scale.startPoint[0];
  let dy = scale.endPoint[1] - scale.startPoint[1];
  let length = Math.sqrt(dx*dx + dy*dy);
  return formatLength(length, unit);
}

let ScaleList = props => (
  <table className="scale-list table table-striped table-hover table-condensed">
    <thead>
      <tr><th></th><th>Image</th><th>World</th></tr>
    </thead>
    <tbody>
      {props.scales.map(scale => (
        <tr key={scale.id}>
          <td width="0" className="text-center">
            <Button bsSize="xsmall" bsStyle="danger"
                onClick={props.onDelete ? () => props.onDelete(scale.id) : null}>
              <Glyphicon glyph="trash" />
            </Button>
          </td>
          <td width="*">{ formatScalePixelLength(scale) } px</td>
          <td width="*">
            { formatLength(scale.length, props.unit) }
            { ' ' }
            { props.unit.shortName }
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default ScaleList
