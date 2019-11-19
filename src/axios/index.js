const axios = require('axios');

exports.getNumenklator = (guidParent = '', guidPosition = '') => {

    return dispatch => {
      axios
        .get("/getNum", {
          params: {
            guidParent: guidParent,
          guidPosition: guidPosition,
          }
        })
        .then(function(response) {
          //console.log( response );

          if (response.status == 200) {
            dispatch({
              type: "GET_AXIOS",
              payload: response.data
            });
          }
        })
        .catch(function(error) {

          let msgError = '';
          if (error.response) {

            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx

            // console.log(error.response.data);
            // console.log(error.response.status);
            // console.log(error.response.headers);

            msgError = error.response.data;

          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js

            //console.log(error.request);
            msgError = error.request;
          } else {
            // Something happened in setting up the request that triggered an Error

            //console.log("Error", error.message);
            msgError = error.message;
          }

          msgError = msgError + '\n' + error.config;

          //console.log( msgError ) ;

          dispatch({
            type: "PUT_AXIOS_AHTUNG",
            payload: msgError
          });
        });
    }
  };

exports.sendEmail = () => {

        axios
          .get("/sendEmail", {
            params: {
            }
          })
          .then(function(response) {
            //console.dir( response );

            if (response.status == 200) {
            }
          })
          .catch(function(error) {

            let msgError = '';
            if (error.response) {

              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx

              // console.log(error.response.data);
              // console.log(error.response.status);
              // console.log(error.response.headers);

              msgError = error.response.data;

            } else if (error.request) {
              // The request was made but no response was received
              // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
              // http.ClientRequest in node.js

              //console.log(error.request);
              msgError = error.request;
            } else {
              // Something happened in setting up the request that triggered an Error

              //console.log("Error", error.message);
              msgError = error.message;
            }

            msgError = msgError + '\n' + error.config;

            console.log( msgError ) ;

          });
    };
