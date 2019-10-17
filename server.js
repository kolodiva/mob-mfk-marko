require('marko/node-require').install();
require('marko/express'); //enable res.marko

var {Pool} = require('pg');

var postgres = require("./components/postgres");

var express     = require('express');
var compression = require('compression'); // Provides gzip compression for the HTTP response


var app = express();
//var port = 8080;
var port = process.env.PORT1 || 8081;

var router = express.Router();

var path = require('path');

var isProduction = process.env.NODE_ENV === 'production';

const dbpg = new Pool( postgres.params_conn );

// Configure lasso to control how JS/CSS/etc. is delivered to the browser
require('lasso').configure({
    plugins: [
        'lasso-marko' // Allow Marko templates to be compiled and transported to the browser
    ],
    outputDir: __dirname + '/static', // Place all generated JS/CSS/etc. files into the "static" dir
    bundlingEnabled: isProduction, // Only enable bundling in production
    minify: isProduction, // Only minify JS and CSS code in production
    fingerprintsEnabled: isProduction, // Only add fingerprints to URLs in production
});

app.use(require('lasso/middleware').serveStatic());

app.use(compression());

app.use( express.static( 'public' ) );

//
// var device = require('express-device');
// app.use(device.capture());

var indexTemplate = require('./index.marko');

router.get('/', async (req, res) => {

  try {

    res.marko(indexTemplate, {
            name: 'Frank',
            count: 30,
            colors: ['red', 'green', 'blue'],
            // device: req.device.type.toUpperCase(),
            isProduction: isProduction,
            dbpg: dbpg,
        });

    // let result = await postgres.getNomenklator( db, '' )
    //
    // //console.log( result );
    //
    // //return res.status(200).send( result );
    // res.render( 'home', { items: result[0], parentguid: result[1], artikul: result[2] } );

  } catch(e) {

      res.status(404).send( e.stack )
    }

});


// app.get('/', function(req, res) {
//     res.marko(indexTemplate, {
//             name: 'Frank',
//             count: 30,
//             colors: ['red', 'green', 'blue']
//         });
// });

app.use('/', router);

app.listen(port, function(err) {
    if (err) {
        throw err;
    }
    console.log('Listening on port %d', port);

    // The browser-refresh module uses this event to know that the
    // process is ready to serve traffic after the restart
    if (process.send) {
        process.send('online');
    }
});
