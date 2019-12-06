const Jimp = require('jimp');

exports.downloadFile  = ( image, fileName = 'jpegFile.jpg' ) => {

    image.getBase64Async( Jimp.MIME_JPEG ).then( data => {

      let a = document.createElement('a');
      a.href = data;
      a.download = fileName;
      a.click();

    });
  }

exports.showBrowser   = ( image = null, el = null ) => {

  if ( image === null ) { return };

  image.getBase64Async( Jimp.MIME_JPEG ).then(
    data => el.src=data
  );

}

exports.loadFile      = ( fileName ) => {
  return Jimp.read( fileName );
}

exports.scaleImage    = ( image, koef = 3 ) => {
  return image.scale(koef, Jimp.RESIZE_BEZIER, (err, img) => { return img } );
}

exports.greyScale   = ( image, threshold = 2900000000 ) => {

  let colorCode;

  let { data, width, height } = image.bitmap;

  return image.scan(0, 0, width, height, function(x, y, idx) {


                  colorCode = Jimp.rgbaToInt( data[idx + 0], data[idx + 1], data[idx + 2], data[idx + 3] );

                  if ( colorCode < threshold ) {

                    this.bitmap.data[idx + 0] = 0;
                    this.bitmap.data[idx + 1] = 0;
                    this.bitmap.data[idx + 2] = 0;
                    this.bitmap.data[idx + 3] = 255;

                  } else {

                    this.bitmap.data[idx + 0] = 255;
                    this.bitmap.data[idx + 1] = 255;
                    this.bitmap.data[idx + 2] = 255;
                    this.bitmap.data[idx + 3] = 255;
                  }

                });
}

exports.saveData      = ( dataArray, fileName = 'dataArray.csv' ) => {

  var data  = new Blob([ dataArray.join('\n') ], {type: 'text/plain'});
  var url   = window.URL.createObjectURL(data);

  let a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();

}


//
exports.countPixels   = ( image, xStep = 5 , yStep = 10, pixels = [] ) => {

  let colorCode;

  let { data, width, height } = image.bitmap;

  return image.scan(0, 0, width, height, function(x, y, idx) {


                  // x, y is the position of this pixel on the image
                  // idx is the position start position of this rgba tuple in the bitmap Buffer
                  // this is the image
                  // pixels = `${x}, ${y}, ${Jimp.rgbaToInt( this.bitmap.data[idx + 0], this.bitmap.data[idx + 1], this.bitmap.data[idx + 2], this.bitmap.data[idx + 3] ).toString(16)};` ;

                  //pixels = '1111111111111111111111111111111';

                  colorCode = Jimp.rgbaToInt( data[idx + 0], data[idx + 1], data[idx + 2], data[idx + 3] );

                  pixels.push( `${x}, ${y},"${ this.bitmap.data[idx + 0]}, ${this.bitmap.data[idx + 1]}, ${this.bitmap.data[idx + 2]}, ${this.bitmap.data[idx + 3]}", ${ colorCode.toString(16) }` );

                  //pixels.push( `${x}, ${y}, ${ this.bitmap.data[idx + 0]}, ${this.bitmap.data[idx + 1]}, ${this.bitmap.data[idx + 2]}, ${this.bitmap.data[idx + 3]}"` );

                  if (colorCode < 2900000000) {
                    // 2800000000
                    // 28184060918

                    this.bitmap.data[idx + 0] = 0;
                    this.bitmap.data[idx + 1] = 0;
                    this.bitmap.data[idx + 2] = 0;
                    this.bitmap.data[idx + 3] = 255;

                  } else {

                    this.bitmap.data[idx + 0] = 255;
                    this.bitmap.data[idx + 1] = 255;
                    this.bitmap.data[idx + 2] = 255;
                    this.bitmap.data[idx + 3] = 255;
                  }

                  if ( x%xStep === 0 || y%yStep === 0 ) {

                      this.bitmap.data[idx + 0] = 255;
                      this.bitmap.data[idx + 1] = 44;
                      this.bitmap.data[idx + 2] = 0;
                      this.bitmap.data[idx + 3] = 255;
                  }
                  //
                  // // rgba values run from 0 - 255
                  // // e.g. this.bitmap.data[idx] = 0; // removes red from this pixel
                  // if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) {
                  //   // image scan finished, do your stuff
                  //   //return pixels;
                  // }

                });
}


// detectors
exports.getBlackPoint = ( image, blackPoint ) => {

  let { data, width, height } = image.bitmap;

  let colorCode;

  image.scan(0, 0, width, height, (x, y, idx) => {

    colorCode = Jimp.rgbaToInt( data[idx + 0], data[idx + 1], data[idx + 2], data[idx + 3] );

    if ( colorCode === 255 ) {
      blackPoint.push( [x, y] )
    }

    if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) {
      //console.log( colorCode[0] );
    }

  });
}

exports.eraseLines = ( image, blackPoint, threshold ) => {

  let tmpArrayX = [], curPosX = 0, totArray = []; difVal = 0; idx = 0;

  let { data } = image.bitmap;

  //x
  blackPoint.forEach( el => {

    tmpArrayX.push( [ el[0], el ] );

    curPosX = tmpArrayX.length - 1;

    if ( curPosX > 0 ) {

       // console.log( curPosX );
       // console.log( tmpArrayX );
      //console.log( tmpArrayX[curPosX][0], tmpArrayX[curPosX-1][0] );

      difVal = tmpArrayX[curPosX][0] - tmpArrayX[curPosX-1][0];

      if ( difVal > 1 || difVal < 0 ) {

        if ( curPosX > threshold ) {
          totArray.push( [tmpArrayX] )
        }

          tmpArrayX = []; tmpArrayX.push( [el[0], el] );

          //console.log( 'curPosX' );

      }
    }

  } );

  totArray.forEach( el => {
    //console.log( el1 );
    el.forEach( el1 => {

      el1.forEach( el2 => {

        idx = image.setPixelColor( 0xFFFFFFFF, el2[1][0], el2[1][1] );

        //data[idx + 0] = 235; data[idx + 1] = 64; data[idx + 2] = 52; data[idx + 3] = 255;

        //console.log( idx );
      });



      //idx = image.getPixelIndex( el1[1][0], el1[1][0] );

      //console.log( el1[1][0], el1[1][0], idx );


      //data[idx + 0] = 235; data[idx + 1] = 64; data[idx + 2] = 52; data[idx + 3] = 255;

    });
  });

}

exports.findSymbol = ( image ) => {

  let w = 20, h = 30; xEl = 0, yEl = 0, aCountPoint = [], pointTotal = 0, pointWhite = 0;

  let { data, width, height } = image.bitmap;

  for (var y = 0; y < height; y += (h + 1) ) {

    yEl++;  xEl = 0;

    for (var x = 0; x < width/2; x += (w + 1) ) {

      xEl++;

      pointTotal = 0; pointWhite = 0;

      image.scan(x, y, x + w, y + h, function( x1, y1, idx) {

        pointTotal++;

        //console.log(x, y, x1, y1);

        if (y1 === 0 || x1 === 0 ) {
            data[idx + 0] = 235; data[idx + 1] = 64; data[idx + 2] = 52; data[idx + 3] = 255;
        }
      });

      console.log( xEl, yEl, pointTotal );

    }
  }



}
