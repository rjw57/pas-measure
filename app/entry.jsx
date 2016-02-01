import React from 'react';

// Redux store.
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import appReducer from './reducers.js';
const loggerMiddleware = createLogger();

const store = createStore(
  appReducer,
  applyMiddleware(
    thunkMiddleware,
    loggerMiddleware
  )
);

import { render } from 'react-dom';
import { Provider } from 'react-redux'
import Application from './components/application.jsx';
render(
  <Provider store={store}><Application /></Provider>,
  document.getElementById('application-body')
);

import { requestSelectRecord, selectRecord } from './actions.js';
let hashId = window.location.hash.substr(1);
if(hashId !== '') {
  store.dispatch(selectRecord(hashId));
} else {
  store.dispatch(requestSelectRecord());
}

store.subscribe(() => {
  let state = store.getState();
  if(state.selectedRecordId) { window.location.hash = state.selectedRecordId; }
});
