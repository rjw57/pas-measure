(function(){

var recordMap, recordImageLayer, recordImage;

// Map object of type { x: ..., y: ..., zoom: ... } to image coord.
function tileCoordToImageCoord(coord, zoom) {
  return {
    x: coord.x / Math.pow(2, zoom),
    y: coord.y / Math.pow(2, zoom)
  };
}

ImageTileLayer = L.TileLayer.Canvas.extend({
  options: {
    async: true,
    maxZoom: 23,
    minZoom: 0,
    continuousWorld:true
  },

  initialize: function() {
    this._image = null;
  },

  drawTile: function(canvas, tilePoint, zoom) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#bbb';
    ctx.fillRect(0, 0, 0.5*canvas.width, 0.5*canvas.height);
    ctx.fillRect(0.5*canvas.width, 0.5*canvas.height, 0.5*canvas.width, 0.5*canvas.height);
    ctx.fillStyle = '#444';
    ctx.fillRect(0.5*canvas.width, 0, 0.5*canvas.width, 0.5*canvas.height);
    ctx.fillRect(0, 0.5*canvas.height, 0.5*canvas.width, 0.5*canvas.height);
    if(this._image) {
      var minPt = tileCoordToImageCoord(tilePoint, zoom),
          maxPt = tileCoordToImageCoord({ x: tilePoint.x+1, y: tilePoint.y+1 }, zoom);
          imScale = this._image.width;

      ctx.drawImage(this._image,
                    minPt.x * imScale, minPt.y * imScale,
                    (maxPt.x - minPt.x) * imScale, (maxPt.y - minPt.y) * imScale,
                    0, 0, this.options.tileSize, this.options.tileSize);
    }
    console.log(tileCoordToImageCoord(tilePoint, zoom));
    this.tileDrawn(canvas);
  },

  setImage: function(image) {
    this._image = image;
    console.log('new img:');
    console.log(this._image);
    this.redraw();
  },

  getImage: function() {
    return this._image;
  },
});

imageTileLayer = function() {
  return new ImageTileLayer();
}

function entry() {
  // Create leaflet UI
  recordMap = L.map('record-map', { minZoom: 1 });
  recordImageLayer = imageTileLayer().addTo(recordMap);
  recordMap.setView([0, 0], 2);

  // Wire up change and input events for database record modal
  $('#database-record-modal-url').on('change input', databaseRecordModalUpdate);

  // Focus URL/id field when database select modal is shown
  $('#database-record-modal').on('shown.bs.modal', function() {
    $('#database-record-modal-url').focus();
  });

  // Wire up Load button events
  $('#database-record-modal-load').click(databaseRecordModalLoad);

  // Wire up select record
  $('[data-action="select-record"]').click(showDatabaseRecordModal);

  setCurrentRecord(null);

  // Is there a location hash?
  if(window.location.hash) {
    setCurrentRecordJsonUrl(getRecordJsonUrl(window.location.hash.substr(1)));
  } else {
    showDatabaseRecordModal();
  }
}

// The current database record
var currentRecord = null;

// Compile the handlebars templates
function compileTemplate(id) { return Handlebars.compile($('#' + id).html()); }
var recordPreviewPanelTemplate = compileTemplate('record-preview-template');

// Set the JSON URL for the record we're actually working on
function setCurrentRecordJsonUrl(jsonUrl) {
  loadRecordFromJsonUrl(jsonUrl).then(setCurrentRecord);
}

// Set the current record
function setCurrentRecord(record) {
  currentRecord = record;

  // That's it if there's no record
  if(!currentRecord) { return; }

  // Do we have an image URL?
  var imageUrl = null, image = document.createElement('img');
  if(currentRecord.imagedir && currentRecord.filename) {
    imageUrl = 'https://finds.org.uk/' + currentRecord.imagedir +
      '/' + currentRecord.filename;

    image.onload = function() { recordImageLayer.redraw(); }
    image.src = imageUrl;
    recordImageLayer.setImage(image);
  } else {
    recordImageLayer.setImage(null);
  }

  console.log(record);
}

// Convert a record ID or URL into a JSON URL. Returns null on error.
function getRecordJsonUrl(recordUrlOrId) {
  var urlRegex = /^https?:\/\/(www\.)?finds\.org\.uk\/database\/artefacts\/record\/id\/([0-9]+)\/?$/;
  var idRegex = /^[0-9]+$/;
  var m, recordId = null;

  // Ensure recordUrlOrId is a string.
  recordUrlOrId = '' + recordUrlOrId;

  // Try matches
  m = urlRegex.exec(recordUrlOrId);
  if(m) {
    recordId = parseInt(m[2]);
  }

  m = idRegex.exec(recordUrlOrId);
  if(m) {
    recordId = parseInt(m[0]);
  }

  // Abort if no match
  if(recordId === null) { return null; }

  // Otherwise form JSON URL
  return 'https://finds.org.uk/database/artefacts/record/id/' +
    recordId + '/format/json';
}

// Return a promise resolved with the database record loaded from the specified
// JSON URL or rejected with an error.
function loadRecordFromJsonUrl(jsonUrl) {
  return $.getJSON(jsonUrl).then(function(record) {
    // Curiously the record returned as a JSON format is an array rather than an
    // object. This may need fixing...
    if(record && (record[0] === 'record')) { record = record[1][0]; }

    // Attempt to handle "fixed" case.
    if(record && (record['record'])) { record = record['record']; }

    return record;
  });
}

// Handle any updates to the database record selection modal
var recordUrlForPreview = null;
function databaseRecordModalUpdate() {
  var newRecordUrl = $('#database-record-modal-url').val(),
      jsonUrl;
  if(newRecordUrl !== recordUrlForPreview) {
    recordUrlForPreview = newRecordUrl;
    jsonUrl = getRecordJsonUrl(recordUrlForPreview);
    if(jsonUrl !== null) {
      setDatabaseRecordModalPreview(null, true);
      loadRecordFromJsonUrl(jsonUrl).then(function(record) {
        setDatabaseRecordModalPreview(record, false);
      }).fail(function(error) {
        setDatabaseRecordModalPreview(null, false, error);
      });
    } else {
      setDatabaseRecordModalPreview(null, false);
    }
  }
}

// Take a record object (or a falsy value) and update preview pane
function setDatabaseRecordModalPreview(record, isLoading, error) {
  // Render template
  $('#database-record-modal-preview').empty().
      html(recordPreviewPanelTemplate({
        record: record, isLoading: isLoading, error: error
      }));

  $('#database-record-modal-load').prop('disabled', !record);
}

function showDatabaseRecordModal() {
  $('#database-record-modal-url').val('');
  databaseRecordModalUpdate();
  $('#database-record-modal').modal('show');
}

function databaseRecordModalLoad() {
  var jsonUrl = getRecordJsonUrl($('#database-record-modal-url').val());
  $('#database-record-modal').modal('hide');
  window.location.hash = $('#database-record-modal-url').val();
  setCurrentRecordJsonUrl(jsonUrl);
}

entry();

})();
