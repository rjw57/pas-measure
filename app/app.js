(function(){

var meas = imageMeasure('record-map');

function entry() {
  $('[data-action="add-scale"]').click(meas.addScale);

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
    loadRecord(window.location.hash.substr(1));
  } else {
    showDatabaseRecordModal();
  }
}

function ImageMeasure(elementId) {
  var self = this;

  var projection = new ol.proj.Projection({
    code: 'flat-image',
    units: 'pixels',
    extent: [0, 0, 512, 512],
  });

  var map = new ol.Map({
    target: 'record-map',
    controls: [],
    view: new ol.View({
      center: [0, 0], projection: projection, zoom: 1,
    }),
  });

  var image = null, imageLayer = null;

  function measurementStyleFunction(feature, resolution) {
    // resolution is "projection units per pixel"
    var perpPixLen = 20, perpLen = resolution * perpPixLen;
    var strokeStyle = new ol.style.Stroke({ color: '#ffcc33', width: 2 });

    var styles = [
      new ol.style.Style({ stroke: strokeStyle }),
    ];

    var geometry = feature.getGeometry();

    if(geometry.getType() === 'LineString') {
      geometry.forEachSegment(function(start, end) {
        var dx = end[0] - start[0], dy = end[1] - start[1];
        var len = Math.sqrt(dx*dx + dy*dy);
        var perpDX = perpLen * -dy / len, perpDY = perpLen * dx / len;
        styles.push(new ol.style.Style({
          geometry: new ol.geom.MultiLineString([
            [
              [start[0] - perpDX, start[1] - perpDY],
              [start[0] + perpDX, start[1] + perpDY],
            ],
            [
              [end[0] - perpDX, end[1] - perpDY],
              [end[0] + perpDX, end[1] + perpDY],
            ],
          ]),
          stroke: strokeStyle,
        }));
      });
    }

    return styles;
  }

  var draw = null;
  var source = new ol.source.Vector();
  var vector = new ol.layer.Vector({
    source: source,
    style: measurementStyleFunction,
  });
  map.addLayer(vector);

  self.getImage = function() { return image; };

  self.setImage = function(newImage) {
    if(imageLayer) { map.removeLayer(imageLayer); }
    image = newImage;
    if(!image) { return; }

    var extent = [0, 0, image.width, image.height];
    projection.setExtent(extent);

    imageLayer = new ol.layer.Image({
      source: new ol.source.ImageStatic({
        url: image.src,
        projection: projection,
        imageExtent: extent
      }),
      zIndex: -100,
    });
    map.addLayer(imageLayer);

    map.getView().fit(extent, map.getSize());
  };

  self.addScale = function() {
    if(draw) { return; }

    draw = new ol.interaction.Draw({
      source: source,
      type: 'LineString',
      minPoints: 2, maxPoints: 2,
      style: function(f, r) {
        var styles = measurementStyleFunction(f, r);
        styles.push(
          new ol.style.Style({
            image: new ol.style.Circle({
              radius: 10,
              stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.7)'
              }),
              fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
              })
            })
          })
        );
        return styles;
      },
    });

    draw.on('drawend', function() {
      map.removeInteraction(draw);
      draw = null;
    });

    map.addInteraction(draw);
  };
}

function imageMeasure(elementId) { return new ImageMeasure(elementId); }

// The current database record
var currentRecord = null;

// Compile the handlebars templates
function compileTemplate(id) { return Handlebars.compile($('#' + id).html()); }
var recordPreviewPanelTemplate = compileTemplate('record-preview-template');

// Triggers a load of a new record from the passed URL/id
function loadRecord(urlOrId) {
  var jsonUrl = getRecordJsonUrl(urlOrId);
  loadRecordFromJsonUrl(jsonUrl).then(setCurrentRecord);
}

// Set the current record
function setCurrentRecord(record) {
  currentRecord = record;
  // That's it if there's no record
  if(!currentRecord) { return; }

  window.location.hash = record.id;

  // Do we have an image URL?
  var imageUrl = null, image = document.createElement('img');
  if(currentRecord.imagedir && currentRecord.filename) {
    imageUrl = 'https://finds.org.uk/' + currentRecord.imagedir +
      '/' + currentRecord.filename;
    image.onload = function() { meas.setImage(image); }
    image.src = imageUrl;
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
  loadRecord($('#database-record-modal-url').val());
  $('#database-record-modal').modal('hide');
}

entry();

})();
