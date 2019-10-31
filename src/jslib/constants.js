///img/group /images
//const params_conn = {user: 'postgres',  host: '127.0.0.1',  database: 'app1',  password: 'c2ec57df699966b3afef779a16fa5fff', port: 12550};
//const params_conn = {user: 'postgres',  host: 'localhost',  database: 'orders',  password: '123', port: 5432};
//const params_conn = {user: 'postgres',  host: 'newfurnitura.ru',  database: 'statistica',  password: '27ac4a1dd6873624b7535fe5660740d6', port: 8815};


const globalVar = {
      imgPath1:      '/img/group',
      imgPath:      '/images',

      paramsConnPg1:    {user: 'postgres',  host: 'localhost',  database: 'orders',  password: '123', port: 5432},
      paramsConnPg:    {user: 'postgres',  host: '127.0.0.1',  database: 'app1',  password: 'c2ec57df699966b3afef779a16fa5fff', port: 12550},

      colorBlueMF:  '#00aec6',
      colorBlackMF: 'black',

      getColor: () => '#00aec6',

      heightHeader: '135px',

      getWinSize: () => { return {width: jQuery(window).width(), height: jQuery(window).height(), } },

      signRur: '&#8381',
    };

module.exports = globalVar;
