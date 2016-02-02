import React from 'react';
import { connect } from 'react-redux'

import {
  selectRecord, cancelSelectRecord, fetchRecordIfNeeded,
  addScale, stopDrawingScale
} from '../actions.js';

import { DRAWING_SCALE } from '../reducers.js';

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
      lengthUnit, features, interaction,
    } = this.props;

    let pixelLengthMean = 0, pixelLengthSqMean = 0, pixelLengthVariance = 0;
    let pixelLengthStdDev;
    if(features.scales.length >= 2) {
      let nFeats = features.scales.length;
      features.scales.forEach(s => {
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
      if(interaction.state === DRAWING_SCALE) {
        dispatch(stopDrawingScale());
      }
      dispatch(addScale(s.startPoint, s.endPoint, s.length));
    }

    let nextScaleLength;
    switch(interaction.state) {
      case DRAWING_SCALE:
        nextScaleLength = interaction.options.length;
        break;
    }

    return (
      <div className="application">
        <div className="application-image">
          <ImageEditor lengthUnit={lengthUnit} imageSrc={imageSrc}
                       features={features}
                       isDrawingScale={interaction.state === DRAWING_SCALE}
                       nextScaleLength={nextScaleLength}
                       onAddScale={onAddScale}
                       pixelLengthMean={pixelLengthMean}
                       pixelLengthStdDev={pixelLengthStdDev}
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
