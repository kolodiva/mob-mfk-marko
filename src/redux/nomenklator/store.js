const { createStore, applyMiddleware, combineReducers, compose  }  = require('redux');
//const { createStore, applyMiddleware, combineReducers, compose  }  = require('../../jslib/redux.min.js');

const { composeWithDevTools }  = require('redux-devtools-extension');

var thunk   = require('redux-thunk').default;

var reducerMainNomenklator    = require('./reducer').getMainNomenklator;
var reducerFoundedNomenklator = require('./reducer').getFoundedNomenklator;

exports.storeNomenklator        = createStore( reducerMainNomenklator,    composeWithDevTools( applyMiddleware( thunk ) ) );
exports.storeFoundedNomenklator = createStore( reducerFoundedNomenklator, composeWithDevTools( applyMiddleware( thunk ) ) );
