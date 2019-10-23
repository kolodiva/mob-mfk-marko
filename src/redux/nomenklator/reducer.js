
module.exports = function(state, action) {

  state = state || {
    value: 0,
    recs: [],
  };

  switch (action.type) {
    case 'INCREMENT':
      return {
        value: state.value + 1
      };
    case 'DECREMENT':
      return {
        value: state.value - 1
      };
    case 'GET_AXIOS':
      //console.log( action.payload );
      return {
        value:  state.value - 1,
        recs:   action.payload,
      };

    default:
      return state;
  }
};
