const view = require('./index');

module.exports = async function(req, res) {
  try {

    res.marko( view, {
            name: 'Frank',
            count: 30,
            colors: ['red', 'green', 'blue'],
            // device: req.device.type.toUpperCase(),
            isProduction: this.isProduction,
            dbpg: this.dbpg,
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
};
