import React from 'react';

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
  return (<div className="sidebar container-fluid">
    <SidebarSection title="Scales">
      <p>hello</p>
    </SidebarSection>
  </div>);
};
