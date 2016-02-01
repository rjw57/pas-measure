import React from 'react';
import { connect } from 'react-redux'

import {
  selectRecord, cancelSelectRecord, fetchRecordIfNeeded, addScale,
  finishedDrawing,
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
      options, features, currentlyDrawing
    } = this.props;

    let currentRecord, currentRecordIsFetching, imageSrc;
    if((selectedRecordId !== null) && (recordsById[selectedRecordId])) {
      currentRecord = recordsById[selectedRecordId].record;
      currentRecordIsFetching = recordsById[selectedRecordId].isFetching;
      imageSrc = imageUrlFromRecord(currentRecord);
    }

    function onAddScale(s) {
      dispatch(finishedDrawing());
      dispatch(addScale(s.startPoint, s.endPoint, s.length));
    }

    return (
      <div className="application">
        <div className="application-image">
          <ImageEditor lengthUnit={options.lengthUnit} imageSrc={imageSrc}
                       features={features} currentlyDrawing={currentlyDrawing}
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

