let React = require('react'),
    ReactDOM = require('react-dom');

module.exports = {};

module.exports.RecordPreview = (props) => (
  <div className="record-preview">
    { props.error ? <_ErrorAlert error={props.error} /> : null }
    { props.record ? <_RecordPreviewBody {...props.record} /> : null}
    { props.isLoading ? <_LoadingThrobber /> : null }
    {
      !props.record ? (
        <p>Enter a database URL or ID to see a preview of the record.</p>
      ) : null
    }
  </div>
);

/* Utility functions */

function imgUrl(imagedir, filename) {
  return `https://finds.org.uk/${imagedir}/${filename}`;
}

/* Internal components */

let _ErrorAlert = (props) => (
  <div className="alert alert-danger" role="alert">
    <strong>Cannot load that record.</strong> The PAS database
    responded with "{ props.error.status }: { props.error.statusText }".
  </div>
);

let _NoImageAlert = (props) => (
  <div className="alert alert-danger" role="alert">
    <strong>This record has no image associated with
    it.</strong> Records must have associated images.
  </div>
);

let _RecordPreviewBody = (props) => (
  <div className="record-preview-body">
    { (!props.filename) ? <_NoImageAlert /> : null }
    <div className="media">
      {
        props.filename ? (
        <div className="media-left">
          <div className="record-preview-image media-object">
            <img className="img-responsive img-thumbnail"
                 src={imgUrl(props.imagedir, props.filename)} />
          </div>
        </div>
        ) : null
      }
      <div className="media-body">
        {
          props.type ? (
            <h4 className="media-heading">{props.type}</h4>
          ) : null
        }
        { /* note: no HTML escaping! */ }
        <div className="record-preview-description"
             dangerouslySetInnerHTML={{__html: props.description }} />
      </div>
    </div>
  </div>
);

let _LoadingThrobber = (props) => (
  <p className="text-center"><img src={require('url!./loading.gif')}/></p>
);


  /*
  let errorAlert = error ? (
    <div className="alert alert-danger" role="alert">
      <strong>Cannot load that record.</strong> The PAS database
      responded with "{ error.status }: { error.statusText }".
    </div>
  ) : null;

  let recordPreview = record ? (
  ) : null;

  return (
    <div className="record-preview">
      { errorAlert }
      { recordPreview }
        <div className="record-preview-body">
          {{#unless record.filename}}
            <div className="alert alert-danger" role="alert">
              <strong>This record has no image associated with
              it.</strong> Records must have associated images.
            </div>
          {{/unless}}
          <div className="media">
            {{#if record.filename}}
              <div className="media-left">
                <div className="record-preview-image media-object">
                  <img className="img-responsive img-thumbnail"
                       src="https://finds.org.uk/{{record.imagedir}}/{{record.filename}}">
                </div>
              </div>
            {{/if}}
            <div className="media-body">
              {{#if record.type }}
                <h4 className="media-heading">{{record.type}}</h4>
              {{/if}}
              {{!-- note: no HTML escaping! --}}
              <div className="record-preview-description">
                {{{ record.description }}}
              </div>
            </div>
          </div>
        </div>
      {{else}}
        {{#if isLoading}}
          <p className="text-center"><img src="loading.gif"></p>
        {{else}}
          <p>Enter a database URL or ID to see a preview of the record.</p>
        {{/if}}
      {{/if}}
    </div>
  );
  */
