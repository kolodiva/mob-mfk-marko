
module.exports = function(state, action) {

  state = state || {
    value: 0,
    recs: [],
    ahtung_postgre:'',
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

      case 'PUT_AXIOS_AHTUNG':
        //console.log( action.payload );
        return {
          ahtung_postgre: 'action.payload',
          recs: [],
        };

    case 'GET_AXIOS':
      //console.log( action.payload );
      return {
        value:  state.value - 1,
        recs:   action.payload,

        ahtung_postgre: '',
      };

    default:
      return state;
  }
};
