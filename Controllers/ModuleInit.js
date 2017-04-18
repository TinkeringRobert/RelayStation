// Local requires
var winston = require('winston');
var node = require('./NodeManager');
var nodesDb = require('./NodesDb');

module.exports = {
	initialize: function(params, broker)
	{
		winston.debug('Starting : ModuleInit');
		nodesDb.initialize(params, broker);
	  node.initialize(params, broker);
	}
}
