var fs = require('fs');

const {Pool}    = require('pg');
const postgres  = require( './postgres' );

const sendmail = require( 'sendmail' )( {silent: true,
  dkim: {
    privateKey: fs.readFileSync('/etc/opendkim/keys/mail.newfurnitura.ru/dkim.private', 'utf8'),
    keySelector: 'dkim'
  }
} );


const dbpg = new Pool(postgres.params_conn);

// const view = require('./index');
const view = require('./index-layout-def');

const getAppParams = (req) => { return { appParams: req.app.get('appParams'), paramsUrl: req.params, qtyParamsUrl: Object.keys(req.params).length,  } };

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
exports.getTest_old = (req, res) => {

  renderHtml(req, res, 'test');

  jimp.read( './public/img/aero2.jpg' ).then( new_image => {

      const { width, height } = new_image.bitmap;

      console.log( width, height, width*height );

      //xLen = 1001;

      // dbpg.query('truncate bitmap').
      // then(
      //   dbpg.query('select count(*) from bitmap').then( res => console.log(res) )
      // );

      let txtQuery = 'insert into bitmap values \n';

      const fillArrayData = new Promise(

        (res, rej) => {

          let v5 = '';

          for (var j = 0; j < height; j++) {

            for (var i = 0; i < width; i++) {

              v5 = new_image.getPixelColor(j, i) ;

            txtQuery += `(${i + 1 + j*width }, ${ v5 }, -1, ${j}, ${i}),`;

            }
          }

          txtQuery = txtQuery.replace(/,$/g, ";")

          res( true );
        }
      );

      // const truncDBase = new Promise(
      //   (res, rej) => {
      //     dbpg.query('truncate bitmap')
      //       .then(
      //        () => {
      //          dbpg.query('select count(*) from bitmap')
      //          .then(
      //            dataSql => res( dataSql.rows[0] )
      //          )
      //        }
      //      );
      //   }
      // );


      fillArrayData
      .then( () => {
        return dbpg.query('truncate bitmap')
          .then(
           () => {
             console.log(`date1 ${Date()}`)

             //console.log( txtQuery );

             fs.writeFile('sqlQuery.txt', txtQuery, (err) => {
                  // In case of a error throw err.
                  if (err) throw err;
              });
             //dbpg.query( txtQuery ).then( () => { console.log(`date2 ${Date()}`) } )
           }
         );
        }
      );


      //console.log( new_image.length, width, height );

      // for (var x = 0; x < 10; x++) {
      //   //console.log( new_image.getPixelIndex(0, x) );
      //   const col1 = new_image.getPixelColor(0, x);
      //   const col2 = jimp.intToRgba( col1 );
      //
      //   console.log( col1, col2 );
      // }

      // let index = 0;
      //                 let rgb_values = [];
      //                 while(index < 100){
      //                     let point = {
      //                         red : new_image[index],
      //                         green : new_image[index + 1],
      //                         blue : new_image[index + 2],
      //                     };
      //
      //
      //                 rgb_values.push(
      //                     {
      //                         red : point.red,
      //                         green : point.green,
      //                         blue : point.blue
      //                     }
      //                 );
      //
      //                 index = index +3;
      //             }
      // console.log( rgb_values );
  });
  // tesseract.recognize("./public/img/ttn.jpg", config)
  // .then(text => {
  //   //console.log("Result:", text)
  //   res.status(200).send( "Result: ", text )
  // })
  // .catch(error => {
  //   console.log(error.message)
  //   res.status(200).send( 'error': error.message )
  // })
  //res.status(200).send( "ok " )
};

exports.getTest = (req, res) => {

  // Jimp.read('./public/img/aero1.jpg').then(image => {
  //   const targetColor = {r: 248, g: 252, b: 251, a: 255};  // Color you want to replace
  //   const replaceColor = {r: 0, g: 0, b: 0, a: 0};  // Color you want to replace with
  //   const colorDistance = (c1, c2) => Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2) + Math.pow(c1.a - c2.a, 2));  // Distance between two colors
  //   const threshold = 32;  // Replace colors under this threshold. The smaller the number, the more specific it is.
  //   image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
  //     const thisColor = {
  //       r: image.bitmap.data[idx + 0],
  //       g: image.bitmap.data[idx + 1],
  //       b: image.bitmap.data[idx + 2],
  //       a: image.bitmap.data[idx + 3]
  //     };
  //     if(colorDistance(targetColor, thisColor) <= 100) {
  //       image.bitmap.data[idx + 0] = replaceColor.r;
  //       image.bitmap.data[idx + 1] = replaceColor.g;
  //       image.bitmap.data[idx + 2] = replaceColor.b;
  //       image.bitmap.data[idx + 3] = replaceColor.a;
  //     } else {
  //       image.bitmap.data[idx + 0] = 255;
  //       image.bitmap.data[idx + 1] = 255;
  //       image.bitmap.data[idx + 2] = 255;
  //       image.bitmap.data[idx + 3] = 255;
  //
  //     }
  //   });
  //   image.write('./public/img/transparent.jpg');
  // });
  renderHtml(req, res, 'test');

};

exports.getHome       = (req, res) => {
  renderHtml(req, res, 'home');
};

exports.getExhibition = (req, res) => {
  renderHtml(req, res, 'exhibition');
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
exports.getMailing = (req, res) => {
  renderHtml(req, res, 'mailing');
};

exports.sendEmail = (req, res) => {

  let params = getAppParams(req);

  console.log(params);

  postgres.mailAction( dbpg, sendmail );

  res.status(200).send( '<h1 style="font-size: 75px">ok Bro</h1>' )
};

exports.getActionFile = (req, res) => {

  let params = req.query;

  postgres.countEmailClick( dbpg, params.email, params.code );

  //console.log( `https://docs.google.com/viewerng/viewer?url=newfurnitura.ru/news/${params.pathfile}` );

  if ( params.pathfiledownload && params.pathfiledownload != '' ) {
    //return res.status(200).sendFile( `.public/news/${params.pathfiledownload}` );
    return res.redirect( `https://newfurnitura.ru/news/${params.pathfiledownload}` );
  }

  res.redirect( `https://docs.google.com/viewerng/viewer?url=newfurnitura.ru/news/${params.pathfileview}` );

  //res.status(200).send( 'ok' )
};

exports.get404 = (req, res) => {
  renderHtml(req, res, 404);
};

//
exports.getNum        = async (req, res) => {

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
exports.getFoundedNum = async (req, res) => {

  let params = req.query;

  //console.log('routs params: ', params);
  // console.log('routs params: ', req.query);

  try {

    let result = await postgres.getFoundedNmnkl(dbpg, params.artikul)

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
