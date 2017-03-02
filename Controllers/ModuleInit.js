// Local requires
var winston = require('winston');
var node = require('./NodeManager');
var udp = require('./UdpController');
var serial = require('./SerialController');
var nodesDb = require('./NodesDb');

module.exports = {
	initialize: function(params, broker)
	{
		winston.debug('Starting : ModuleInit');
		nodesDb.initialize(params, broker);
		udp.initialize(params, broker);
		serial.initialize(params);
	  node.initialize(params, broker);
	}
}
