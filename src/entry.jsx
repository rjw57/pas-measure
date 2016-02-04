// Bootstrap magic
require('expose?$!expose?jQuery!jquery');
require('bootstrap-webpack');

// Openlayers and associated style
require('openlayers');
require('openlayers/dist/ol.css');

import React from 'react';

// Redux store.
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk'
import appReducer from './reducers.js';

let middleware = [thunkMiddleware];

if(process.env.NODE_ENV !== 'production') {
  let createLogger = require('redux-logger');
  middleware = [...middleware, createLogger()];
}

const store = createStore(
  appReducer,
  applyMiddleware(...middleware)
);

import { render } from 'react-dom';
import { Provider } from 'react-redux'
import Application from './components/application.jsx';

let applicationBody = document.createElement('div');
document.body.appendChild(applicationBody);

render(
  <Provider store={store}><Application /></Provider>,
  applicationBody
);

import { requestSelectRecord, selectRecord } from './actions.js';
let hashId = window.location.hash.substr(1);

if(hashId !== '') {
  store.dispatch(selectRecord(hashId));
}

store.subscribe(() => {
  let state = store.getState();
  if(state.selectedRecordId) { window.location.hash = state.selectedRecordId; }
});
