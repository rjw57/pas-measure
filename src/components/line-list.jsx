import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';

import { formatLength } from '../utils.js';

function formatLineLength(line) {
  // use a fake pixel unit if none supplied
  let unit = { id: 'px', shortName: 'px', length: 1 };
  let dx = line.endPoint[0] - line.startPoint[0];
  let dy = line.endPoint[1] - line.startPoint[1];
  let length = Math.sqrt(dx*dx + dy*dy);
  return formatLength(length, unit) + ' ' + unit.shortName;
}

let LineList = props => (
  <table className="line-list table table-striped table-hover table-condensed">
    <tbody>
      {props.lines.map(line => (
        <tr key={line.id}>
          <td width="0" className="text-center">
            <Button bsSize="xsmall" bsStyle="danger"
                onClick={props.onDelete ? () => props.onDelete(line.id) : null}>
              <Glyphicon glyph="trash" />
            </Button>
          </td>
          <td width="100%">
            { formatLineLength(line) }
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default LineList
