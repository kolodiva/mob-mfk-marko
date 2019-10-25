
const globalVar = {
      colorBlueMF:  '#00aec6',
      colorBlackMF: 'black',

      getColor: () => '#00aec6',

      heightHeader: '120px',

      getWinSize: () => { return {width: jQuery(window).width(), height: jQuery(window).height(), } },
    };

module.exports = globalVar;
