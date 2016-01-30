import React from 'react';
import { Button, Input } from 'react-bootstrap';
import { connect } from 'react-redux'

import { startDrawing, SCALE, setLengthUnit } from '../actions.js';

import { formatLength } from '../utils.js';

import ScaleList from './scale-list.jsx';
import Options from './options.jsx';

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

function filterState(state) {
  let { options } = state;
  return { options };
}

class LengthInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { inputValue: '' };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.unit !== this.props.unit) {
      // Convert the input field if necessary
      if(this.state.inputValue) {
        let val = parseFloat(this.state.inputValue);
        val *= this.props.unit.length;
        this.setState({ inputValue: formatLength(val, nextProps.unit) });
      }
    }
  }

  handleInput(event) {
    this.setState({ inputValue: event.target.value }, () => {
      if(this.props.onInput) { this.props.onInput(this.getLengthInMetres()); }
    });
  }

  getLengthInMetres() {
    if(!this.state.inputValue) { return null; }
    let val = parseFloat(this.state.inputValue);
    val *= this.props.unit.length;
    return val;
  }

  render() {
    return (
      <Input ref="input" type="number" placeholder="1.23" step="0.1"
             value={this.state.inputValue} onInput={(e) => this.handleInput(e)}
             addonAfter={this.props.unit.shortName} />
    );
  }
}

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { scaleLength: null };
  }

  handleAddScaleClick() {
    console.log('length: ', this.state.scaleLength);
    this.props.dispatch(startDrawing(SCALE, {
      worldLength: this.state.scaleLength
    }));
  }

  render() {
    let { dispatch, options } = this.props;
    let addScaleDisabled = !this.props.record ||
      (this.state.scaleLength === null);
    return (
      <div className="sidebar container-fluid">
        <SidebarSection title="Options">
          <Options
            lengthUnit={options.lengthUnit}
            onLengthUnitSelected={unit => dispatch(setLengthUnit(unit))}
          />
        </SidebarSection>
        <SidebarSection title="Scales">
          <LengthInput unit={options.lengthUnit}
                       onInput={l => this.setState({ scaleLength: l })}/>
          <Button block disabled={addScaleDisabled}
                  onClick={() => this.handleAddScaleClick()}>
            Add scale
          </Button>
        </SidebarSection>
      </div>
    );
  }
}

Sidebar = connect(filterState)(Sidebar);

export default Sidebar;
