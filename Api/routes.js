var http = require('http');
var _ = require('lodash');

module.exports = function(app, nodesDb) {

	// create todo and send back all todos after creation
	app.get('/nodes/:uuid', function(req, res) {
		console.log("GET :: /nodes/:uuid");
		console.log(req.params.uuid);
		return res.send("Data :)");
  });

	// create todo and send back all todos after creation
	app.get('/query/:query', function(req, res) {
		console.log("GET :: /query/" + req.params.query);
		nodesDb.runQuery(req.params.query, function(result){
			return res.send(result);
		});
	});

	app.get('/nodes', function(req, res) {
		console.log("GET :: /nodes");

		nodesDb.getNodesFromDb(function(result){
			return res.send(result);
		});
	});

	app.get('/controllers', function(req, res) {
		console.log("GET :: /controllers");

		nodesDb.runQuery("SELECT * FROM controllers", function(result){
			var controllers = {};
			controllers.nodes = [];
			_.forEach(result, function (node) {
				controllers.nodes.push({"nr": node.controller_name, "id": node.id, "group": "1", "fill_color": "Red"});
			});
			return res.send(controllers);
		});
	});
};
