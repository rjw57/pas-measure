import React from 'react';
import { Button, Input, Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux'

import {
  startDrawingScale,
  setLengthUnit, removeScale
} from '../actions.js';

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
  let { lengthUnit, features } = state;
  return { lengthUnit, features };
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
    let addButton = (
      <Button onClick={this.props.onAdd} disabled={this.props.addDisabled}>
        { /* <small> because Glyphicon is a little too large for addon button */ }
        <small><Glyphicon glyph="plus" /></small>
      </Button>
    );
    return (
      <Input ref="input" type="number" placeholder="1.23" step="0.1"
             value={this.state.inputValue} onInput={(e) => this.handleInput(e)}
             addonAfter={this.props.unit.shortName}
             buttonBefore={addButton} />
    );
  }
}

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { scaleLength: null };
  }

  handleAddScaleClick() {
    this.props.dispatch(startDrawingScale(this.state.scaleLength));
  }

  handleDeleteScale(scaleId) {
    this.props.dispatch(removeScale(scaleId));
  }

  render() {
    let { dispatch, lengthUnit, features } = this.props;
    let addScaleDisabled = !this.props.record ||
      (this.state.scaleLength === null);
    return (
      <div className="sidebar container-fluid">
        <SidebarSection title="Options">
          <Options
            lengthUnit={lengthUnit}
            onLengthUnitSelected={unit => dispatch(setLengthUnit(unit))}
          />
        </SidebarSection>
        <SidebarSection title="Scales">
          {
            features.scales.length > 0 ?
              <ScaleList scales={features.scales} unit={lengthUnit}
                         onDelete={s => this.handleDeleteScale(s)} />
              : null
          }
          <LengthInput unit={lengthUnit}
                       onInput={l => this.setState({ scaleLength: l })}
                       onAdd={() => this.handleAddScaleClick()}
                       addDisabled={addScaleDisabled} />
        </SidebarSection>
        <SidebarSection title="Lines">
          <Button block>
            <Glyphicon glyph="plus" /> Add line
          </Button>
        </SidebarSection>
        <SidebarSection title="Circles">
          <Button block>
            <Glyphicon glyph="plus" /> Add circle
          </Button>
        </SidebarSection>
      </div>
    );
  }
}

Sidebar = connect(filterState)(Sidebar);

export default Sidebar;
