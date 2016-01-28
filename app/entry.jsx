require('style!css!./style.css');

var ReactDOM = require('react-dom'),
    React = require('react'),
    App = require('./components/app.jsx');

ReactDOM.render(
  React.createElement(App, null), document.getElementById('app')
);

require('./app.js');
