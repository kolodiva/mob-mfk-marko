const { createStore, applyMiddleware, combineReducers, compose  }  = require('redux');
//const { createStore, applyMiddleware, combineReducers, compose  }  = require('../../jslib/redux.min.js');

const { composeWithDevTools }           = require('redux-devtools-extension');

var thunk   = require('redux-thunk').default;

var reducerNomenkl = require('./reducer');

module.exports = createStore( reducerNomenkl, composeWithDevTools( applyMiddleware( thunk ) ) );
