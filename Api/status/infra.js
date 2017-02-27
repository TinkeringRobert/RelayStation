var http = require('http');
var moment = require('moment');
var _ = require('lodash');

module.exports = function(app) {
	// create todo and send back all todos after creation
	app.get('/status/infra/allModules', function(req, res) {
		console.log("GET :: /infra/allModules");

    var options = {
      host: '10.0.0.101',
      port: 5000,
      path: '/allModules'
    };

    http.get(options, function(request) {
      var body = '';
      request.on('data', function(chunk) {
        body += chunk;
      });
      request.on('end', function() {
        //console.log(body);
				var modules = JSON.parse(body);
				_.forEach(modules, function(module){
					if (module.last_seen !== null && module.last_seen !== undefined){
						module.time_indicator = moment(module.last_seen).fromNow();
					}
					console.log(module);
				})
				console.log(modules);
        return res.send(modules);
      });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
      return res.status(500).send('getting all modules failed');
    });
	});
};
