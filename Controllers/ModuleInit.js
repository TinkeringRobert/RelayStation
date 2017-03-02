// Local requires
var node = require('./NodeManager');
var udp = require('./UdpController');
var serial = require('./SerialController');
var nodesDb = require('./NodesDb');

module.exports = {
	initialize: function(params, broker)
	{
	    console.log('Starting : ModuleInit');
		nodesDb.initialize(params, broker);
		// udp.initialize(params, broker);
		serial.initialize(params, broker);
	  node.initialize(params, broker);
	}
}
