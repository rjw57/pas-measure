import React from 'react';

/*
require('style!css!./style.css');
require('./app.jsx');
*/

// Redux store.
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import appReducer from './reducers.js';
const loggerMiddleware = createLogger()
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

import { requestSelectRecord } from './actions.js';
store.dispatch(requestSelectRecord());
