import React from 'react';
import { connect } from 'react-redux'

import {
  selectRecord, cancelSelectRecord, fetchRecordIfNeeded,
  addScale, stopDrawingScale
} from '../actions.js';

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
      options, features, interactions,
    } = this.props;

    let currentRecord, currentRecordIsFetching, imageSrc;
    if((selectedRecordId !== null) && (recordsById[selectedRecordId])) {
      currentRecord = recordsById[selectedRecordId].record;
      currentRecordIsFetching = recordsById[selectedRecordId].isFetching;
      imageSrc = imageUrlFromRecord(currentRecord);
    }

    let scaleInt = interactions.scale;

    function onAddScale(s) {
      if(scaleInt && scaleInt.isDrawing) {
        dispatch(stopDrawingScale());
      }
      dispatch(addScale(s.startPoint, s.endPoint, s.length));
    }

    return (
      <div className="application">
        <div className="application-image">
          <ImageEditor lengthUnit={options.lengthUnit} imageSrc={imageSrc}
                       features={features}
                       isDrawingScale={scaleInt ? scaleInt.isDrawing : false}
                       nextScaleLength={scaleInt ? scaleInt.length : null}
                       onAddScale={onAddScale} />
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

