//import * as glob  from '../../jslib/constants'
var glob = require("../jslib/constants");

//var port    =   process.env.PORT || 8080;
var { genGuid } = require("../jslib/enother.js");

const params_conn = glob.paramsConnPg;
//const params_conn = {user: 'postgres',  host: 'localhost',  database: 'orders',  password: '123', port: 5432};

const connect = (db)  => {
	console.log( db );
};

const getServicesList = (db) => {

  const qryText = 'SELECT * FROM services;'
  const params  = [];

  return db.query( qryText, params ).then( res => { return JSON.stringify(res.rows) } )
}

const saveServiceParams = (db, qryText) => {

  //const qryText = 'SELECT * FROM services;'
  const params  = [];

  return db.query( qryText, params ).then( res => { return JSON.stringify(res) } )
}


const taskProc = (db, params) => {

	let qryParams, qryText;

	switch(params.oper) {

		case '1':

			//starts Tasks with id = params.id within filials
			qryParams = [ params.id, genGuid() ];

			qryText = "with new_tasks as (with tasks as (with service as (select 0 id_task, id, proc_name, \
								unnest(array[0,1,2,3,4,5,6]) as filial_id, \
								unnest(array[filial_0, filial_1, filial_2, filial_3, filial_4, filial_5, filial_6]) filial from services where id=$1) \
									select filial_id, id, null id_task , proc_name, null created_at, null done_at from service where filial=1 \
									union all \
									select filial, id_service, id_task , service_name, created_at, done_at from active_tasks where id_service=1 and done_at is null) \
										select filial_id, id, proc_name, max(id_task) from tasks group by filial_id, id, proc_name having max(id_task) is null) \
											insert into active_tasks ( filial, id_service, id_task, service_name ) \
	  											( select filial_id, id, $2, proc_name from new_tasks)";

						//.then( res => { return JSON.stringify(res.rows) } )
						//console.log(qryText);
			return db.query( qryText, qryParams ).then( res => { return 'ok' } )

			break;

		case '2':

			//get current non-done tasks
			if (params.filial) {

				qryParams = [ params.filial ];

				qryText = "select t1.*, t2.params, t2.get_data, t2.send_data from active_tasks t1 inner join services t2 on t1.id_service = t2.id  where t1.done_at is null and filial = $1 order by t1.created_at";

			} else {

				qryParams = [];

				qryText = "select t1.*, t2.params, t2.get_data, t2.send_data from active_tasks t1 inner join services t2 on t1.id_service = t2.id  where t1.done_at is null order by t1.created_at";
			}

			return db.query( qryText, qryParams ).then( res => { return JSON.stringify(res.rows) } )

			break;

		default:
			throw new Error('Ahtung. Такой операции ' + params.oper + ' НЕ существует.');
	}

  //const qryText = 'SELECT * FROM services;'
  // const params  = [];

  // return db.query( qryText, params ).then( res => { return JSON.stringify(res) } )
}

const getNomenklator = (db, parentguid, artikul='') => {

  const qryText = "select artikul, artikul_new, name, t1.guid, t1.parentguid, t1.pic_guid, \
  				unit_type_id, to_char( coalesce(t2.qty1, 0), '9 999 999 999.000') qty1, \
  					to_char(coalesce(t2.qty2, 0), '9 999 999 999.000') qty2, \
  						to_char(coalesce(t2.qty3, 0), '9 999 999 999.000') qty3, \
  							to_char(coalesce(t2.price1, 0), '9 999 999 999.00') price1, \
  								to_char(coalesce(t2.price2, 0), '9 999 999 999.00') price2 \
  									from nomenklators t1 left join blnc_mob t2 on t1.guid = t2.guid where parentguid in \
  										( select parentguid from nomenklators where case when $2='%' then parentguid=$1 else artikul like $2 end order by artikul limit 1) \
  											order by artikul, name;"

  const params  = [ parentguid, artikul + '%' ];

  //console.log( params );

  return db.query( qryText, params ).then( res => { return [res.rows, res.rows.length == 0 ? '' : res.rows[0].parentguid, artikul ] } )
}

////////////////////////////////////////////////////////
const getNmnkl = (db, guidParent = '', guidPosition = '') => {

	//console.log( 'postgre guidParent: ', guidParent );


  // const qryText = "select artikul, artikul_new, name, t1.guid, t1.parentguid, t1.guid_picture, t1.itgroup \
  // 									from nomenklators t1 where case when $1='' then parentguid is null else parentguid = $1 end and guid <> 'yandexpagesecret' and guid <> 'sekretnaya_papka' \
  // 											order by sort_field, name;"

	const params  = [ guidParent ];

	const qryText = "with t2 as( \
											select name nameParent0, parentguid guidParent0 \
											from nomenklators \
											where case when $1='' then guid is null else guid = $1 end\
											limit 1 \
										) \
										select t1.artikul, t1.artikul_new, t1.name,  \
										t1.guid, t1.parentguid, t1.guid_picture, t1.itgroup, t1.level_group, \
										case when t2.guidParent0 is null then 'В суть вещей...' else t2.nameParent0 end nameParent0,  \
										case when t2.guidParent0 is null then '' else t2.guidParent0 end guidParent0, \
										case when t2.guidParent0 is null then '/catalog' else concat('/catalog/', t2.guidParent0) end pathParent0 \
										from nomenklators t1 left join t2 on true \
										where case when $1='' then t1.parentguid is null else t1.parentguid = $1 end \
										and t1.guid not in (select 'yandexpagesecret' guid union all select 'sekretnaya_papka') \
										order by t1.sort_field, t1.name;"

	return db.query( qryText, params ).then( res => {

		const rows = res.rows;
		//console.log(qryText.replace(/\s\s+/g, ' '), params);

			return [
				rows,
			]
		}
	);
}

module.exports = { params_conn: params_conn,
						connect: connect,
							getServicesList: getServicesList,
								saveServiceParams: saveServiceParams,
									taskProc: taskProc,
										getNomenklator: getNomenklator,
											getNmnkl: getNmnkl, }
