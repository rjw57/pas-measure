import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';

import {
  selectRecord, cancelSelectRecord, fetchRecordIfNeeded,
  addScale, stopDrawingScale, stopDrawingLine, stopDrawingCircle,
  addLine, addCircle, requestSelectRecord
} from '../actions.js';

import {
  DRAWING_SCALE, DRAWING_LINE, DRAWING_CIRCLE
} from '../reducers/interaction.js';

import { imageUrlFromRecord } from '../pas-api.js';
import ImageEditor from './image-editor.jsx'
import SelectRecordModal from './select-record-modal.jsx';
import Sidebar from './sidebar.jsx'

require('./application.css');

function filterState(state) {
  return state;
}

let WelcomeOverlay = props => (
  <div className={'application-welcome-overlay ' + (props.show ? '' : 'hidden')}>
    <div className="application-welcome-overlay-inner container-fluid">
      <div className="jumbotron">
        <h1>Let's get measuring&hellip;</h1>
        <p>
          This site lets you measure the dimensions of objects recorded in
          the <a href="https://finds.org.uk/">Portable Antiquities Scheme's
          database</a>. The records need to have an associated image with
          visible scale.
        </p>
        <p>
          Before you can start you need to select a record from the database.
        </p>
        <p>
          <Button onClick={props.onSelectRecord}
                  bsStyle="primary" bsSize="large">
            Select a record
          </Button>
        </p>
      </div>
    </div>
  </div>
);

export default connect(filterState)(React.createClass({
  handleSelectRecordModalSubmit: function() {
    this.props.dispatch(cancelSelectRecord());
    this.props.dispatch(selectRecord(
      this.refs.selectRecordModal.state.record.id
    ));
  },

  componentDidMount: function() {
    const { dispatch, selectedRecordId } = this.props;
    dispatch(fetchRecordIfNeeded(selectedRecordId));
  },

  componentWillReceiveProps: function(nextProps) {
    if(nextProps.selectedRecordId !== this.props.selectedRecordId) {
      const { dispatch, selectedRecordId } = nextProps;
      dispatch(fetchRecordIfNeeded(selectedRecordId));
    }
  },

  render: function() {
    const {
      dispatch, showSelectRecordModal, recordsById, selectedRecordId,
      lengthUnit, scales, interaction, lines, circles,
    } = this.props;

    // Compute an estimate of pixel length from scale sources
    let pixelLengthSamples = scales.map(s => {
      let dx = s.endPoint[0] - s.startPoint[0];
      let dy = s.endPoint[1] - s.startPoint[1];
      return s.length / Math.sqrt(dx*dx + dy*dy);
    });

    let pixelLengthEstimate = { mu: null, sigma: null };
    if(pixelLengthSamples.length >= 2) {
      let pixelLengthMean = pixelLengthSamples.reduce(
        (sum, next) => sum + next, 0
      ) / pixelLengthSamples.length;
      let pixelLengthVar = pixelLengthSamples.reduce(
        (sum, next) => Math.pow(next - pixelLengthMean, 2), 0
      ) / (pixelLengthSamples.length - 1);

      pixelLengthEstimate.mu = pixelLengthMean;
      pixelLengthEstimate.sigma = Math.sqrt(pixelLengthVar);
    }

    let currentRecord, currentRecordIsFetching, imageSrc;
    if((selectedRecordId !== null) && (recordsById[selectedRecordId])) {
      currentRecord = recordsById[selectedRecordId].record;
      currentRecordIsFetching = recordsById[selectedRecordId].isFetching;
      imageSrc = imageUrlFromRecord(currentRecord);
    }

    function onAddScale(s) {
      if(interaction.state === DRAWING_SCALE) { dispatch(stopDrawingScale()); }
      dispatch(addScale(s.startPoint, s.endPoint, s.length));
    }

    function onAddLine(s) {
      if(interaction.state === DRAWING_LINE) { dispatch(stopDrawingLine()); }
      dispatch(addLine(s.startPoint, s.endPoint));
    }

    function onAddCircle(s) {
      if(interaction.state === DRAWING_CIRCLE) { dispatch(stopDrawingCircle()); }
      dispatch(addCircle(s.startPoint, s.endPoint));
    }

    let nextScaleLength;
    switch(interaction.state) {
      case DRAWING_SCALE:
        nextScaleLength = interaction.options.length;
        break;
    }

    let showWelcome = !currentRecord && !currentRecordIsFetching;

    return (
      <div className="application">
        <div className="application-image">
          <ImageEditor lengthUnit={lengthUnit} imageSrc={imageSrc}
                       scales={scales} lines={lines} circles={circles}
                       isDrawingScale={interaction.state === DRAWING_SCALE}
                       nextScaleLength={nextScaleLength}
                       onAddScale={onAddScale}
                       isDrawingLine={interaction.state === DRAWING_LINE}
                       onAddLine={onAddLine}
                       isDrawingCircle={interaction.state === DRAWING_CIRCLE}
                       onAddCircle={onAddCircle}
                       pixelLengthEstimate={pixelLengthEstimate}
                       />
        </div>
        <div className="application-sidebar">
          <Sidebar record={currentRecord} />
        </div>
        <WelcomeOverlay show={showWelcome}
                        onSelectRecord={() => dispatch(requestSelectRecord())}
                        />
        <SelectRecordModal
          show={showSelectRecordModal} ref="selectRecordModal"
          onCancel={() => dispatch(cancelSelectRecord())}
          onSubmit={this.handleSelectRecordModalSubmit}
        />
      </div>
    );
  },
}));

