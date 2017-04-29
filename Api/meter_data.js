var http = require('http');
var _ = require('lodash');
var moment = require('moment');

module.exports = function(app, nodesDb, params) {
	// create todo and send back all todos after creation
	app.get('/node/rgb', function(req, res) {
		console.log("GET :: /energymeter actual data");

		console.log(params.server_ip);
		console.log(params.application_port.relay_station);
		var options = {
			host: "10.0.0.100",//params.server_ip,
			port: params.application_port.relay_station,
			path: '/energymeterdata/1'
		};

		http.get(options, function(request) {
			var body = '';
			request.on('data', function(chunk) {
				body += chunk;
			});
			request.on('end', function() {
				var result = JSON.parse(body);
				result[0].pv_meter =  -result[0].pv_meter;
				// Dont show export yet
				if (result[0].kwh_meter <= 0) {
					result[0].kwh_meter = 0;
				}
				// Find the biggest value
				//var biggest = getBiggest(result[0]);
				//var divider = biggest / 255;
				// console.log("Var 1 == " + result[0].kwh_meter);
				// console.log("Var 2 == " + result[0].hh_meter);
				// console.log("Var 3 == " + result[0].pv_meter);
				// console.log("Big   == " + biggest);
				// console.log("Div   == " + divider);
				// console.log("Var 1 == " + parseInt(result[0].kwh_meter/divider));
				// console.log("Var 2 == " + parseInt(result[0].hh_meter/divider));
				// console.log("Var 3 == " + parseInt(result[0].pv_meter/divider));
				return res.status(200).send(
					{
						r:parseInt(result[0].kwh_meter),
						g:parseInt(result[0].hh_meter),
						b:parseInt(result[0].pv_meter)
					}
				);
				return res.status(200).send(JSON.parse(body));
			});
		}).on('error', function(e) {
			console.log("Got error: " + e.message);
			return res.status(500).send('getting actual energymeterdata failed');
		});
	});

	// create todo and send back all todos after creation
	app.get('/energymeterdata/actual', function(req, res) {
		console.log("GET :: /energymeter actual data");

		console.log(params.server_ip);
		console.log(params.application_port.relay_station);
		var options = {
			host: params.server_ip,
			port: params.application_port.relay_station,
			path: '/energymeterdata/1'
		};

		http.get(options, function(request) {
			var body = '';
			request.on('data', function(chunk) {
				body += chunk;
			});
			request.on('end', function() {
				return res.status(200).send(JSON.parse(body));
			});
		}).on('error', function(e) {
			console.log("Got error: " + e.message);
			return res.status(500).send('getting actual energymeterdata failed');
		});
	});

	// create todo and send back all todos after creation
	app.get('/energymeterdata/:amount', function(req, res) {
		console.log("GET :: Current meterdata");
		var amount = 30;
		if(req.params.amount !== undefined){
			amount = req.params.amount;
		}

		nodesDb.getEnergyMeterValue(amount, function(result){
			_.forEach(result, function(field) {
				field.utc = moment.utc(field.timestamp).valueOf();
			});

			return res.status(200).send(result);
		});
	});

	// create todo and send back all todos after creation
	app.get('/energymeterdata/day/:day', function(req, res) {
		console.log("GET :: Day meterdata");
		var start = new Date();
		nodesDb.getEnergyMeterValueDay(req.params.day, function(result){
			// for(var index = 0; index < result.length; ++index) {
			// 	result[index].utx = moment.utc(result[index].timestamp).valueOf();
			// }
			var before = new Date();
			_.forEach(result, function(field) {
				field.utc = moment.utc(field.timestamp).valueOf();
			});
			var end = new Date();
			console.log('db call = ' + (before - start));
			console.log('data    = ' + (end - before));
			console.log('total   = ' + (end - start));
			return res.status(200).send(result);
		});
	});
};

function getBiggest(result){
	var biggest = 0;
	if( result.kwh_meter > biggest) {
		biggest = result.kwh_meter;
	}
	if( result.hh_meter > biggest) {
		biggest = result.hh_meter;
	}
	if( result.pv_meter > biggest) {
		biggest = result.pv_meter;
	}
	return biggest;
}
