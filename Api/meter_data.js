var http = require('http');
var _ = require('lodash');
var moment = require('moment');

module.exports = function(app, nodesDb, params) {

	// create todo and send back all todos after creation
	app.get('/energymeterdata/actual', function(req, res) {
		console.log("GET :: /energymeter actual data");

		console.log(params.server_ip);
		console.log(params.application_port.relaystation);
		var options = {
			host: params.server_ip,
			port: params.application_port.relaystation,
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
