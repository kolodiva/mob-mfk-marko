const { createStore, applyMiddleware }  = require('redux');
const { composeWithDevTools }           = require('redux-devtools-extension');

var thunk   = require('redux-thunk').default;

var reducerNomenkl = require('./reducer');

module.exports = createStore( reducerNomenkl, composeWithDevTools( applyMiddleware( thunk ) ) );
