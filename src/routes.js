var fs = require('fs');

const {Pool}    = require('pg');
const postgres  = require("./postgres");

const dbpg = new Pool(postgres.params_conn);

// const view = require('./index');
const view = require('./index-layout-def');

const getAppParams = (req) => { return { appParams:req.app.get('appParams'), paramsUrl:req.params, qtyParamsUrl:Object.keys(req.params).length,  } };

const renderHtml = (req, res, htmlPath, status = 200) => {
  //
  let params = getAppParams(req);

  try {

    res.status(status).marko(view, {
      $global: {
        isProduction: params.appParams.isProduction,
        htmlPath: htmlPath,
      },
    });

  } catch (e) {
    res.status(404).send(e.stack)
  }

};

//
exports.getHome       = (req, res) => {
  renderHtml(req, res, 'home');
};

exports.getCatalog    = (req, res) => {
  //renderHtml(req, res, 'catalog');
  //
  let params = getAppParams(req);

  // console.log('routs params: ', req.params);
  // console.log('routs query: ', req.query);

  const guidParent = req.params && req.params.guidParent || '';

  try {

    res.status(200).marko(view, {
      $global: {
        isProduction: params.appParams.isProduction,
        htmlPath: 'catalog',
        guidParent: guidParent,
      },
    });

  } catch (e) {
    res.status(404).send(e.stack)
  }


};

exports.getContacts   = (req, res) => {

  try {

    res.status(200).marko(view, {
      $global: {
        htmlPath: 'contacts',
      },
    });

  } catch (e) {
    res.status(404).send(e.stack)
  }
};

//
exports.getTest = (req, res) => {
  renderHtml(req, res, 'test');
};

exports.sendEmail = (req, res) => {

  postgres.mailAction( dbpg );

  res.status(200).send( 'ok' )
};

exports.getActionFile = (req, res) => {

  let params = req.query;

  //console.log( `https://docs.google.com/viewerng/viewer?url=newfurnitura.ru/news/${params.pathfile}` );

  if ( params.pathfileview != '' ) {
    return res.redirect( `https://docs.google.com/viewerng/viewer?url=newfurnitura.ru/news/${params.pathfileview}` );
  }

  res.status(200).sendFile( `https://newfurnitura.ru/news/${params.pathfiledownload}` );

  //res.status(200).send( 'ok' )
};

exports.get404 = (req, res) => {
  renderHtml(req, res, 404);
};

//
exports.getNum = async (req, res) => {

  let params = req.query;

  // console.log('routs params: ', req.params);
  // console.log('routs params: ', req.query);

  try {

    let result = await postgres.getNmnkl(dbpg, params.guidParent)

    // postgres.getNmnkl(dbpg, params.guidParent).then( res => {
    //
    //   return res.status(200).send('res');
    //
    // }
    //
    // )

    return res.status(200).send(result);

    //console.log('ffffffffff', result);


  } catch (e) {

    return res.status(404).send(e.stack)
  }

};
