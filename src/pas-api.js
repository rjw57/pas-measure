import $ from 'jquery';
import fetch from 'isomorphic-fetch'

// Fetch a record from the PAS database by record ID. Returns a promise which is
// resolved with the JSON object on success or rejected on failure.
export function fetchRecordById(id) {
  let url = `https://finds.org.uk/database/artefacts/record/id/${id}/format/json`;
  return fetch(url).then(response => {
    if(!response.ok) {
      console.error('Request failed:', response);
      throw new Error('Bad response from server.');
    }
    return response.json();
  }).then(record => {
    // Curiously the record returned as a JSON format is an array rather than an
    // object. This may need fixing...
    if(record && (record[0] === 'record')) { record = record[1][0]; }

    // Attempt to handle "fixed" case.
    if(record && (record['record'])) { record = record['record'][0]; }

    return record;
  });
}

// Convert a record ID or URL into a JSON URL. Returns null on error.
export function jsonUrlFromRecordIdOrUrl(recordUrlOrId) {
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
  return `https://finds.org.uk/database/artefacts/record/id/${recordId}/format/json`;
}

// Return a promise resolved with the database record loaded from the specified
// JSON URL or rejected with an error.
export function loadRecordFromJsonUrl(jsonUrl) {
  return $.getJSON(jsonUrl).then(function(record) {
    // Curiously the record returned as a JSON format is an array rather than an
    // object. This may need fixing...
    if(record && (record[0] === 'record')) { record = record[1][0]; }

    // Attempt to handle "fixed" case.
    if(record && (record['record'])) { record = record['record'][0]; }

    return record;
  });
}

// Return a URL for an image associated with the database record or null if
// there is no image
export function imageUrlFromRecord(record) {
  if(!record || !record.filename || !record.imagedir) { return null; }
  return `https://finds.org.uk/${record.imagedir}/${record.filename}`;
}
