import React from 'react';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux'

import { startDrawing, SCALE } from '../actions.js';
import ScaleList from './scale-list.jsx';

let SidebarSection = (props) => (
  <div className="sidebar-section">
    <h4 className="sidebar-section-title clearfix">
      {props.title}
    </h4>
    <div className="sidebar-section-body">
      {props.children}
    </div>
  </div>
);

export default connect(() => ({}))((props) => {
  let ifRecord;
  let scales = [
    { length: 45 }, { length: 56 }
  ];
  if(props.record) {
    ifRecord = (<div>
      <SidebarSection title="Current record">
        { props.record.id }
      </SidebarSection>
      <SidebarSection title="Scales">
        <ScaleList scales={scales} />
        <Button block onClick={() => props.dispatch(startDrawing(SCALE))}>
          Add scale
        </Button>
      </SidebarSection>
    </div>);
  }

  return (
    <div className="sidebar container-fluid">
    { ifRecord }
    </div>
  );
});
