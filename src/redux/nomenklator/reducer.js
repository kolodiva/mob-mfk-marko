module.exports = function(state, action) {

  state = state || {
    recs: [],
    ahtung_postgre: '',
  };

  switch (action.type) {
    case 'PUT_AXIOS_AHTUNG':
      //console.log( action.payload );
      return {
        ahtung_postgre: action.payload,
      };

    case 'GET_AXIOS':
      //console.log( action.payload );
      return {
        recs: action.payload[0],

        ahtung_postgre: '',
      };

    default:
      return state;
  }
};
