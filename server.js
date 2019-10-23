require('marko/express'); //enable res.marko
require('marko/node-require').install();

var express     = require('express');
var compression = require('compression'); // Provides gzip compression for the HTTP response

var app = express();
//var port = 8080;
//var port = process.env.PORT1 || 8080;
var port = process.env.PORT1 || 8081;

var router = express.Router();

var path = require('path');

var isProduction = process.env.NODE_ENV === 'production';

// Configure lasso to control how JS/CSS/etc. is delivered to the browser
require( 'lasso' ).configure({
    plugins: [
        'lasso-marko' // Allow Marko templates to be compiled and transported to the browser
    ],
    outputDir: __dirname + '/static', // Place all generated JS/CSS/etc. files into the "static" dir
    bundlingEnabled: isProduction, // Only enable bundling in production
    minify: isProduction, // Only minify JS and CSS code in production
    fingerprintsEnabled: isProduction, // Only add fingerprints to URLs in production
});

app.use( require('lasso/middleware').serveStatic() );

app.use( compression() );

app.use( express.static( 'public' ) );

//
app.set( 'appParams', { 'isProduction': isProduction, } );

const routes = require('./src/routes');

//
router.get( '/',        routes.getHome );

router.get( '/catalog', routes.getCatalog );

router.get( '/test',    routes.getTest );

router.get( '/getNum/:id',  routes.getNum );

router.get( '*',          routes.get404 );

//
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
