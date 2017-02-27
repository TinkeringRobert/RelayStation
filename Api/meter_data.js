var http = require('http');
var _ = require('lodash');
var moment = require('moment');

module.exports = function(app, nodesDb) {

	// create todo and send back all todos after creation
	app.get('/energymeterdata/actual', function(req, res) {
		console.log("GET :: /energymeter actual data");

		var options = {
			host: '10.0.0.200',
			port: 3000,
			path: '/energymeterdata/1'
		};

		http.get(options, function(request) {
			var body = '';
			request.on('data', function(chunk) {
				body += chunk;
			});
			request.on('end', function() {
				//console.log(body);
				var energy = JSON.parse(body);
				// _.forEach(modules, function(module){
				// 	if (module.last_seen !== null && module.last_seen !== undefined){
				// 		module.time_indicator = moment(module.last_seen).fromNow();
				// 	}
				// 	console.log(module);
				// })
				console.log(energy);
				return res.status(200).send(energy);
			});
		}).on('error', function(e) {
			console.log("Got error: " + e.message);
			return res.status(500).send('getting all modules failed');
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
			return res.send(result);
		});
	});
};
