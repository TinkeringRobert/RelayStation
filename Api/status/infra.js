var http = require('http');
var moment = require('moment');
var _ = require('lodash');

module.exports = function(app, params) {
	// create todo and send back all todos after creation
	app.get('/status/infra/allModules', function(req, res) {
		console.log("GET :: /infra/allModules");

    var options = {
			host: params.server_ip,
			port: params.application_port.starchart,
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
				});

        return res.send(modules);
      });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
      return res.status(500).send('getting all modules failed');
    });
	});
};
