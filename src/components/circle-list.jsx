import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';

import { formatLength } from '../utils.js';

function formatCircleLength(circle) {
  // use a fake pixel unit if none supplied
  let unit = { id: 'px', shortName: 'px', length: 1 };
  let dx = circle.endPoint[0] - circle.startPoint[0];
  let dy = circle.endPoint[1] - circle.startPoint[1];
  let length = Math.sqrt(dx*dx + dy*dy);
  return formatLength(length, unit) + ' ' + unit.shortName;
}

let CircleList = props => (
  <table className="circle-list table table-striped table-hover table-condensed">
    <tbody>
      {props.circles.map(circle => (
        <tr key={circle.id}>
          <td width="0" className="text-center">
            <Button bsSize="xsmall" bsStyle="danger"
                onClick={props.onDelete ? () => props.onDelete(circle.id) : null}>
              <Glyphicon glyph="trash" />
            </Button>
          </td>
          <td width="100%">
            { formatCircleLength(circle) }
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default CircleList
