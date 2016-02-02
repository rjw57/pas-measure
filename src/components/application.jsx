import React from 'react';
import { connect } from 'react-redux'

import {
  selectRecord, cancelSelectRecord, fetchRecordIfNeeded,
  addScale, stopDrawingScale, stopDrawingLine, stopDrawingCircle,
  addLine
} from '../actions.js';

import {
  DRAWING_SCALE, DRAWING_LINE, DRAWING_CIRCLE
} from '../reducers/interaction.js';

import { imageUrlFromRecord } from '../pas-api.js';
import ImageEditor from './image-editor.jsx'
import SelectRecordModal from './select-record-modal.jsx';
import Sidebar from './sidebar.jsx'

require('style!css!./application.css');

function filterState(state) {
  return state;
}

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
      lengthUnit, scales, interaction, lines,
    } = this.props;

    let pixelLengthMean = 0, pixelLengthSqMean = 0, pixelLengthVariance = 0;
    let pixelLengthStdDev;
    if(scales.length >= 2) {
      let nFeats = scales.length;
      scales.forEach(s => {
        let dx = s.endPoint[0] - s.startPoint[0];
        let dy = s.endPoint[1] - s.startPoint[1];
        let pixelLength = s.length / Math.sqrt(dx*dx + dy*dy);
        pixelLengthMean += pixelLength;
        pixelLengthSqMean += pixelLength * pixelLength;
      });
      pixelLengthMean /= nFeats;
      pixelLengthSqMean /= nFeats;
      pixelLengthVariance = pixelLengthSqMean -
        (1.0 - 1.0 / nFeats) * pixelLengthMean * pixelLengthMean;
      pixelLengthStdDev = Math.sqrt(pixelLengthVariance);
    } else {
      pixelLengthMean = null;
      pixelLengthVariance = null;
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
      // dispatch(addCircle(s.startPoint, s.endPoint));
    }

    let nextScaleLength;
    switch(interaction.state) {
      case DRAWING_SCALE:
        nextScaleLength = interaction.options.length;
        break;
    }

    let pixelLengthEstimate = { mu: pixelLengthMean, sigma: pixelLengthStdDev };

    return (
      <div className="application">
        <div className="application-image">
          <ImageEditor lengthUnit={lengthUnit} imageSrc={imageSrc}
                       scales={scales} lines={lines}
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
        <SelectRecordModal
          show={showSelectRecordModal} ref="selectRecordModal"
          onCancel={() => dispatch(cancelSelectRecord())}
          onSubmit={this.handleSelectRecordModalSubmit}
        />
      </div>
    );
  },
}));

