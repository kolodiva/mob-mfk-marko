//import * as glob  from '../../jslib/constants'
var glob = require("../jslib/constants");

//var port    =   process.env.PORT || 8080;
var { genGuid } = require("../jslib/enother.js");

exports.params_conn = glob.paramsConnPg;

//const params_conn = {user: 'postgres',  host: 'localhost',  database: 'orders',  password: '123', port: 5432};

exports.connect = (db)  => {
	console.log( db );
};

exports.getServicesList = (db) => {

  const qryText = 'SELECT * FROM services;'
  const params  = [];

  return db.query( qryText, params ).then( res => { return JSON.stringify(res.rows) } )
}

exports.saveServiceParams = (db, qryText) => {

  //const qryText = 'SELECT * FROM services;'
  const params  = [];

  return db.query( qryText, params ).then( res => { return JSON.stringify(res) } )
}


exports.taskProc = (db, params) => {

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

exports.getNomenklator = (db, parentguid, artikul='') => {

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
exports.getNmnkl_old = (db, guidParent = '', guidPosition = '') => {

	//console.log( 'postgre guidParent: ', guidParent );

	const qryText = `with t2 as( \
											select name nameParent0, parentguid guidParent0 \
											from nomenklators \
											where case when '${guidParent}'='' then guid is null else guid = '${guidParent}' end \
											limit 1 \
										) \
										select t1.artikul, t1.artikul_new, t1.name,  \
										t1.guid, t1.parentguid, t1.guid_picture, t1.itgroup, t1.level_group, \
										case when t2.guidParent0 is null then 'В суть вещей...' else t2.nameParent0 end nameParent0,  \
										case when t2.guidParent0 is null then '' else t2.guidParent0 end guidParent0, \
										case when t2.guidParent0 is null then '/catalog' else concat('/catalog/', t2.guidParent0) end pathParent0, \
										prt.price1, prt.price2, prt.price3  \
										from nomenklators t1
										left join t2 on true \
										left join ( \
										select * \
										            from crosstab( \
										            $$select nomenklator_id::text, price_type_id, round(price*coalesce(currencies.value, 1), 2) \
										            from prices \
										            left join currencies on prices.currency_id = currencies.code \
										            where nomenklator_id in ( select guid from nomenklators where case when '${guidParent}'='' then parentguid is null else parentguid = '${guidParent}' end \
										            ) \
										            order by 1$$, \
										            $$ SELECT '000000004' UNION ALL SELECT '000000003' UNION ALL SELECT '000000005'$$ \
															) \
										            AS (guid text, price1 numeric, price2 numeric, price3 numeric)) as prt  on t1.guid=prt.guid
										where case when '${guidParent}'='' then t1.parentguid is null else t1.parentguid = '${guidParent}' end \
										and t1.guid not in (select 'yandexpagesecret' guid union all select 'sekretnaya_papka') \
										order by t1.sort_field, t1.name;`

// console.log( qryText.replace(/\s+/g," ") );

	//const params = [];

	return db.query( qryText ).then( (res) => {

					const rows = res.rows;
					//console.log(rows);
					//console.log(qryText.replace(/\s\s+/g, ' '), params);

					return [
							rows,
						]
});

}

exports.getNmnkl = (db, guidParent = '', guidPosition = '') => {

	//console.log( 'postgre guidParent: ', guidParent );

	const qryText =	`with price_list_total as ( \
			with price_list_with_compl as ( \
			select * \
			from crosstab( \
			$$select nomenklator_id::text, price_type_id, round(price*coalesce(currencies.value, 1), 2) \
			from prices \
			left join currencies on prices.currency_id = currencies.code  \
			where nomenklator_id in ( \
			select distinct \
					coalesce(complects.guid_complect, nomenklators.guid) as guid \
				from nomenklators \
			         left join complects on complects.nomenklator_id = nomenklators.guid \
					  where case when '${guidParent}'='' then nomenklators.parentguid is null else nomenklators.parentguid = '${guidParent}' end \
			) \
			order by 1$$, \
			$$ SELECT '000000004' UNION ALL SELECT '000000003' UNION ALL SELECT '000000005'$$ \
		) \
			AS (guid text, price1 numeric, price2 numeric, price3 numeric) \
		) \
		select \
			nomenklators.guid, \
			sum(round(coalesce(complects.qty, 1) * pl.price1, 2)) as price1, \
			sum(round(coalesce(complects.qty, 1) * pl.price2, 2)) as price2, \
			sum(round(coalesce(complects.qty, 1) * pl.price3, 2)) as price3 \
			from nomenklators \
			   left join complects on complects.nomenklator_id = nomenklators.guid \
		   	   left join price_list_with_compl as pl on pl.guid = nomenklators.guid or pl.guid = complects.guid_complect \
		   	   group by nomenklators.guid) \
		select 	nomenklators.guid, \
						nomenklators.level_group,
		 				case when nomenklParent.parentguid is null then 'В суть вещей...' else nomenklParent.parentguid end nameParent0,  \
		 				case when nomenklParent.parentguid is null then '' else nomenklParent.parentguid end guidParent0, \
						case when nomenklParent.parentguid is null then '/catalog' else concat('/catalog/', nomenklParent.parentguid) end guidParent0, \
		        nomenklators.artikul, \
		        nomenklators.artikul_new, \
		        nomenklators.name, \
		        nomenklators.synonym, \
		        nomenklators.itgroup, \
		        nomenklators.guid_picture, \
		        (case when (position('#{findField}' in nomenklators.artikul)>0) then 100 else 0 end)::int + (position('#{findField}' in nomenklators.artikul_new)>0)::int + (position('#{findField}' in nomenklators.name)>0)::int as findField, \
		        nomenklators.sort_field, \
		        nomenklators.describe, \
		        nomenklators.is_complect, \
		        case when nomenklators.itgroup then '' else coalesce( case when nomenklators.is_complect > 0 then 'компл.' else unit_types.name end, 'нет ед.изм.') end as unit_name, \
			COALESCE(price_list_total.price1, 0.00) as price1, \
			COALESCE(price_list_total.price2, 0.00) as price2, \
			COALESCE(price_list_total.price3, 0.00) as price3, \
			COALESCE(order_goods.qty, 0.0000) as qty_order, \
			round(COALESCE(order_goods.price, 0.00), 2) as price_order \
			from nomenklators \
			left join price_list_total on nomenklators.guid = price_list_total.guid \
			left join orders on orders.id=-1 and orders.status = 0 \
			left join order_goods on order_goods.order_id=-1 and price_list_total.guid = order_goods.nomenklator_id \
			left join unit_types on nomenklators.unit_type_id = unit_types.code \
			left join nomenklators as nomenklParent on case when '${guidParent}'='' then nomenklators.guid is null else nomenklators.guid = '${guidParent}' end \
			where case when '${guidParent}'='' then nomenklators.parentguid is null else nomenklators.parentguid = '${guidParent}' end  \
			and nomenklators.guid not in (select 'yandexpagesecret' guid union all select 'sekretnaya_papka') \
			ORDER BY  nomenklators.itgroup desc, findField DESC, nomenklators.sort_field, nomenklators.name, nomenklators.artikul;`

// console.log( qryText.replace(/\s+/g," ") );

	//const params = [];

	return db.query( qryText ).then( (res) => {

					const rows = res.rows;
					//console.log(rows);
					//console.log(qryText.replace(/\s\s+/g, ' '), params);

					return [
							rows,
						]
});

}

exports.getFoundedNmnkl = (db, artikul = '') => {

	//console.log( 'postgre guidParent: ', guidParent );
	//console.log('postgre: ', artikul);

	strQueryWhereExactly  = " = '" 			+ artikul.split(' ').join('').toLowerCase()  + "' "
	strQueryWhere         = " like '%" 	+ artikul.split(' ').join('%').toLowerCase() + "%' "
	strQueryWhereArtikul  = " like '" 	+ artikul.split(' ').join('%').toLowerCase() + "%' "

	const qryText =	`SELECT DISTINCT nomenklators.guid, nomenklators.name,  nomenklators.artikul,
	        min(case when (lower(nomenklators.artikul) ${strQueryWhereExactly} or lower(nomenklators.artikul_new) ${strQueryWhereExactly} ) then 0 else 1 end) as ord
	                  FROM
	                  nomenklators

	              WHERE ( ( lower(nomenklators.name) ${strQueryWhere}
	                    OR lower(nomenklators.artikul)  ${strQueryWhereArtikul}
	                    OR lower(nomenklators.artikul_new) ${strQueryWhereArtikul}
	                      AND NOT nomenklators.itgroup and nomenklators.parentguid!='yandexpagesecret' and nomenklators.parentguid!='sekretnaya_papka'
											)) group by nomenklators.guid, nomenklators.name,  nomenklators.artikul ORDER BY ord, nomenklators.name limit 30;`

 //console.log( qryText.replace(/\s+/g," ") );

	//const params = [];

	return db.query( qryText ).then( (res) => {

					const rows = res.rows;
					//console.log(rows);
					//console.log(qryText.replace(/\s\s+/g, ' '), params);

					return [
							rows,
						]
});

}

exports.mailAction = (db, sendmail) => {

	//console.log( 'postgre guidParent: ', guidParent );

	//РАССЫЛАЕТСЯ ВСЕГДА ТОЛЬКО ОДНА АКЦИЯ
	// const qryText = `with t1 as ( select distinct md5(id::varchar) mail_id, description, content, query_txt, attachments, mail_at, noactive, unnest( group_id ) group_id \
	// 										from mailings where noactive=false and id=4) \
	// 										select t1.* , t2.email, md5(t2.id::varchar) user_id, t3.email_from \
	// 										from t1 \
	// 										left join mailing_lists t2 \
	// 									  on t1.group_id = t2.group_id and t2.subscribed=true
	// 										inner join mailing_groups t3 \
	// 									  on t3.group_id = t2.group_id and t2.subscribed=true;`
//11771
											const qryText = `with t1 as ( select distinct md5(id::varchar) mail_id, description, content, query_txt, attachments, mail_at, noactive, unnest( group_id ) group_id \
																					from mailings where noactive=false and id=12) \
																					select t1.* , t2.email, md5(t2.id::varchar) user_id, case when t3.email_from is null or t3.email_from=''   then 'mfc@newfurnitura.ru' else t3.email_from end  email_from
																					from t1 \
																					left join mailing_lists t2 \
																				  on t2.subscribed=true and t1.group_id = t2.group_id\
																					inner join mailing_groups t3 \
																				  on t3.group_id = t2.group_id;`

// console.log( qryText.replace(/\s+/g," ") );

	//const params = [];

	return db.query( qryText ).then( (res) => {

					const rows = res.rows;

					var emails = [];

					rows.forEach( el => {
						emails.push( [el.email, el.user_id, el.email_from] );
					} );

					//console.log( rec0 );
					//to: 'kolodiva@mail.ru, kolodiva@gmail.com, gl-@list.ru, adv.mfc@gmail.com,  mebel_furnitura@hotmail.com',

					var rec0 = rows[0];
					var strHtml = '';

					const mailLength = emails.length;
					let counter = 0;

					emails.forEach( email => {

						counter++;

						console.log( counter + '/' + mailLength, email[0] )

						strHtml = rec0.content.replace('[msgUnsubscribe]', 	`https://newfurnitura.ru/unscribe_email?email=${email[0]}&code=${email[1]}`);

						strHtml = strHtml.replace('[msgCountClick]', 	`email=${email[1]}&code=${rec0.mail_id}`);
						strHtml = strHtml.replace('[msgCountClick]', 	`email=${email[1]}&code=${rec0.mail_id}`);
						strHtml = strHtml.replace('[mailToFilial]', 	`mailto:${email[2]}`);


						// let promise = new Promise(function(resolve, reject) {
  					// 	// задача, не требующая времени
  					// 	reject(123); // мгновенно выдаст результат: 123
						// });

							//console.log( email, strHtml );

							//var res = Promise( function(resolve, reject ) {

							sendmail({
									from: 'no-replay@newfurnitura.ru',
									to: email[0],
									subject: rec0.description,
									html: strHtml + rec0.attachments,
								}, function ( err, reply ) {

										if (err) {
												console.log( email[0], ' - ERROR ERROR ERROR email: ' + err );
												db.query( `update mailing_lists set comment='${err}' where email='${email[0]}'` )
												.catch( (err) => { console.log( '------> ERROR ERROR ERROR pgsql: ', err )  } );
										} else {
												console.log( email[0], ' - done' )
										}
								}
							);


							// 	}
							// );

							//promise.then( (res) => { console.log( 'promise ok: ', res ) }, (err) => { console.log( 'promise error: ',  err ) } );


							// try {
							// 	sendmail({
							//     from: rec0.email_from,
							//     to: email[0],
							//     subject: rec0.description,
							// 		html: strHtml,
							//     // attachments: [
							//     //   {
							//     //     filename: 'mfk_expo_msk_2019.pdf',
							//     //     path: '/home/ftp_user/www/images/mailing/expo_msk_2019.pdf'
							//     //   }
							//     // ]
							//   }, function (err, reply) {
							//
							// 		if (err && err.stack) {
							// 				//console.log( email[0], err.stack )
							// 				db.query( `update mailing_lists set subscribed=false where email=${email[0]}` ).then( (res) => { return ' -- ' + email[0] + ' not exist and unscribed.' });
							// 		}
							//     // console.dir( reply )
							//   });
							//
							// } catch (e) {
							// 	db.query( `update mailing_lists set subscribed=false where email=${email[0]}` ).then( (res) => { return ' -- ' + email[0] + ' not exist and unscribed.' });
							// } finally {
							//
							// }

						// sendmail({
					  //   from: rec0.email_from,
					  //   to: email[0],
					  //   subject: rec0.description,
						// 	html: strHtml,
					  //   // attachments: [
					  //   //   {
					  //   //     filename: 'mfk_expo_msk_2019.pdf',
					  //   //     path: '/home/ftp_user/www/images/mailing/expo_msk_2019.pdf'
					  //   //   }
					  //   // ]
					  // }, function (err, reply) {
						//
						// 	if (err && err.stack) {
						// 			//console.log( email[0], err.stack )
						// 			db.query( `update mailing_lists set subscribed=false where email=${email[0]}` ).then( (res) => { return ' -- ' + email[0] + ' not exist and unscribed.' });
						// 	}
					  //   // console.dir( reply )
					  // });

					});
});

}

exports.countEmailClick = (db, user_id, mailing_id) => {

	const dateStamp = Date.now();

	const qryText = `with t1 as ( delete from mailing_feedbacks where user_id='${user_id}' and mailing_id='${mailing_id}' ) \
										  insert into mailing_feedbacks(user_id, mailing_id, created_at, updated_at) values ( '${user_id}', '${mailing_id}', to_timestamp(${dateStamp} / 1000.0), to_timestamp(${dateStamp} / 1000.0) );`

 //console.log( qryText.replace(/\s+/g," ") );

	//const params = [];

	return db.query( qryText ).then( (res) => {});
}
