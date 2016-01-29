import React from 'react';
import { connect } from 'react-redux'

import {
  selectRecord, cancelSelectRecord, fetchRecordIfNeeded
} from '../actions.js';

import ImageEditor from './image-editor.jsx'
import SelectRecordModal from './select-record-modal.jsx';
import Sidebar from './sidebar.jsx'

require('style!css!./application.css');

export default connect(s=>s)(React.createClass({
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
      dispatch, showSelectRecordModal, recordsById, selectedRecordId
    } = this.props;

    let currentRecord, currentRecordIsFetching;
    if((selectedRecordId !== null) && (recordsById[selectedRecordId])) {
      currentRecord = recordsById[selectedRecordId].record;
      currentRecordIsFetching = recordsById[selectedRecordId].isFetching;
    }

    return (
      <div className="application">
        <div className="image-editor">
          <ImageEditor record={currentRecord} />
        </div>
        <div className="sidebar">
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

