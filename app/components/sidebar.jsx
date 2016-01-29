import React from 'react';
import { Button } from 'react-bootstrap';

let SidebarSection = (props) => (
  <div className="sidebar-section">
    <h4 className="sidebar-sectiont-title clearfix">
      {props.title}
    </h4>
    <div className="sidebar-section-body">
      {props.children}
    </div>
  </div>
);

export default (props) => {
  let ifRecord;
  let { dispatch } = props;
  console.log(dispatch);

  if(props.record) {
    ifRecord = (<div>
      <SidebarSection title="Current record">
        { props.record.id }
      </SidebarSection>
      <SidebarSection title="Scales">
        <Button block>Add scale</Button>
      </SidebarSection>
    </div>);
  }

  return (
    <div className="sidebar container-fluid">
    { ifRecord }
    </div>
  );
};
