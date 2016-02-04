import React from 'react';
import { Alert, Button, Input, Modal, Panel } from 'react-bootstrap';

import {
  imageUrlFromRecord, jsonUrlFromRecordIdOrUrl, loadRecordFromJsonUrl
} from '../pas-api.js';

const recordUrlPlaceholder = 'https://finds.org.uk/database/artefacts/record/id/764383';

require('./select-record-modal.css');

export default React.createClass({
  getInitialState: function() { return {
    recordUrl: this.props.initialRecordUrl, jsonUrl: null,
    record: null, isLoading: false, loadError: null,
  }; },

  componentDidMount: function() {
    this.loadRecordPreview();
  },

  setRecordUrl: function(recordUrl) {
    this.setState({ recordUrl }, () => this.loadRecordPreview());
  },

  loadRecordPreview: function() {
    // Does this record URL have a corresponding JSON url?
    let jsonUrl = jsonUrlFromRecordIdOrUrl(this.state.recordUrl);
    this.setState({ record: null, loadError: null, jsonUrl });

    // No? We need do no mode.
    if(jsonUrl === null) { return; }

    // Yes? Kick off a load.
    this.setState({ isLoading: true });
    loadRecordFromJsonUrl(jsonUrl).then(
      record => this.setState({ record, isLoading: false }),
      error => this.setState({ loadError: error, isLoading: false })
    );
  },

  // Only records with images are "valid"
  isRecordValid: function() {
    return this.state.record && this.state.record.filename
  },

  handleFormSubmit: function(evt) {
    evt.preventDefault();
    if(!this.isRecordValid() || !this.props.onSubmit) { return; }
    this.props.onSubmit(evt);
  },

  render: function() { return (
    <Modal show={this.props.show}>
      <Modal.Header closeButton autoFocus onHide={this.props.onCancel}>
        <Modal.Title>Select database record</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>PAS Database records are identified by their URL (Uniform Resource
        Locator). Enter a record URL to load the associated image. Generally it is
        easiest to cut-and-paste the URL of the record from your web-browser.</p>

        <form onSubmit={this.handleFormSubmit}>
          <Input type="text" placeholder={recordUrlPlaceholder}
                 value={this.props.initialRecordUrl} label="Record URL"
                 onInput={(e) => this.setRecordUrl(e.target.value)}
                 />
        </form>

        <Panel header="Record preview">
          { this.state.loadError ? <LoadError error={this.state.loadError} /> : null }
          {
            this.state.record ?
              <RecordPreview record={this.state.record} /> 
              : (<p>Enter a database URL or ID to see a preview of the record.</p>)
          }
          { this.state.isLoading ? <LoadingThrobber /> : null }
        </Panel>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.props.onCancel}>Close</Button>
        <Button onClick={this.props.onSubmit}
                disabled={!this.isRecordValid()}
                bsStyle="primary">
          Load
        </Button>
      </Modal.Footer>
    </Modal>
  ); },
});

let LoadingThrobber = (props) => (
  <p className="text-center"><img src={require('url!./loading.gif')}/></p>
);

let LoadError = (props) => (
  <Alert bsStyle="danger">
    <strong>Cannot load record.</strong> The PAS database
    responded with "{ props.error.status }: { props.error.statusText }".
  </Alert>
);

let NoImageAlert = (props) => (
  <Alert bsStyle="danger">
    <strong>This record has no image associated with it.</strong> Records must
    have associated images.
  </Alert>
);

let RecordPreview = (props) => (
  <div className="record-preview">
    { (!props.record.filename) ? <NoImageAlert /> : null }
    <div className="media">
      {
        props.record.filename ? (
        <div className="media-left">
          <div className="record-preview-image media-object">
            <img className="img-responsive img-thumbnail"
                 src={imageUrlFromRecord(props.record)} />
          </div>
        </div>
        ) : null
      }
      <div className="media-body">
        {
          props.record.type ? (
            <h4 className="media-heading">{props.record.type}</h4>
          ) : null
        }
        { /* note: no HTML escaping! */ }
        <div className="record-preview-description"
             dangerouslySetInnerHTML={{__html: props.record.description }} />
      </div>
    </div>
  </div>
);

