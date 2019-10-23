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
exports.getHome = (req, res) => {
  renderHtml(req, res, 'home');
};

exports.getCatalog = (req, res) => {
  renderHtml(req, res, 'catalog');
};

exports.getTest = (req, res) => {
  renderHtml(req, res, 'test');
};

exports.get404 = (req, res) => {
  renderHtml(req, res, 404);
};

//
exports.getNum = async (req, res) => {

  try {

    let result = await postgres.getNmnkl(dbpg, '')

    return res.status(200).send(result);

  } catch (e) {

    return res.status(404).send(e.stack)
  }

};
