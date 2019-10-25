
const globalVar = {
      colorBlueMF:  '#00aec6',
      colorBlackMF: 'black',

      getColor: () => '#00aec6',

      getWinSize: () => { return {width: jQuery(window).width(), height: jQuery(window).height(), } },
    };

module.exports = globalVar;
