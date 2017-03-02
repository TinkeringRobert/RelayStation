var nodesDb = require('./NodesDb');
var mqtt = require('mqtt');
var winston = require('winston');

var parser = require('./Utils/SensorDataParser');
var client;
var params;
var handleUdpNodeMessage = null;
var handleSerialNodeMessage = null;

module.exports = {
	initialize: function(Params)
	{
		params = Params;
		client = mqtt.connect(params.mqtt.host);
		winston.info('Starting : NodeManager');
    winston.info('-------------------------------------------');

		client.on('connect', function () {
      // Publish itself
			sendModuleRegistration(params);

			handleUdpNodeMessage = params.mqtt.prefix + 'udp_node_msg';
			winston.debug('Subscribe to :: ' + handleUdpNodeMessage);
			client.subscribe(handleUdpNodeMessage);

			handleSerialNodeMessage = params.mqtt.prefix + 'serial_node_msg';
			winston.debug('Subscribe to :: ' + handleSerialNodeMessage);
			client.subscribe(handleSerialNodeMessage);
    });

		setInterval(sendNodeKeepAlive, 10*1000);

		client.on('message', function (topic, message) {

			// message is Buffer
			if (topic === handleUdpNodeMessage) {
				var udpMsg = JSON.parse(message);
				parser.addNodeIdFromNode(udpMsg);

				addOrUpdateNode(udpMsg);
				if (udpMsg.status !== undefined && udpMsg.status === "measure"){
					storeSensorData(udpMsg);
					return;
				}
			}
			if (topic == handleSerialNodeMessage) {
				var serialMsg = JSON.parse(message);

				addOrUpdateNode(serialMsg);
				if (serialMsg.status !== undefined && serialMsg.status === "measure"){
					storeSensorData(serialMsg);
			   	return;
				}
			}

			winston.silly(topic.toString());
			winston.silly(message.toString());
		});
	}
}

// Check if the node already exist if not add to the database
function addOrUpdateNode( message ) {
	nodesDb.findNode(message.nodeId, function(result){
		// Add or update the node Uuid and reportDate
		if (result === false) {
			nodesDb.addNode(message.nodeId, message.date);
		} else {
			nodesDb.updateNode(message.nodeId, message.date);
		}
	});
}

// Check if the node already exist if not add to the database
function storeSensorData( message ) {
	parser.validateMinimalData(message, function(valid){
		if (valid === true){
			var stored = "";
			stored += parser.parseTemperatureData(message);
			stored += parser.parseHumidityData(message);
			stored += parser.parseBatteryData(message);
			stored += parser.parseEnergyMeterData(message);
			winston.debug("Stored :: " + stored + " :: For " + message.nodeId);
		}
	});
}

function sendNodeKeepAlive() {
	winston.debug('Send hartbeat');
	if (client !== null && client !== undefined && params !== null && params !== undefined) {
		client.publish(
			params.mqtt.prefix + 'udp_transmit_msg',
			JSON.stringify({udpMsg: '&&{"node":"0000"}##'})
		);
	}
}

function sendModuleRegistration(params) {
	// Publish the channel registration
	client.publish( params.mqtt.prefix + 'module_reg', JSON.stringify({name:'NodeManager', type:'application'}));
	client.publish(	params.mqtt.prefix + 'module_reg', JSON.stringify({name:params.mqtt.prefix + 'udp_node_msg', type:'queue'}));
	client.publish(	params.mqtt.prefix + 'module_reg', JSON.stringify({name:params.mqtt.prefix + 'serial_node_msg', type:'queue'}));
	client.publish( params.mqtt.prefix + 'module_reg', JSON.stringify({name:params.mqtt.prefix + 'transmitUdpMsg', type:'queue'}));

	client.publish(	params.mqtt.prefix + 'modules_relation', JSON.stringify({from:'NodeManager', to:'NodesDb'}));

	// Publish relation from to channels
	client.publish( params.mqtt.prefix + 'modules_relation', JSON.stringify({from:params.mqtt.prefix + 'udp_node_msg', to:'NodeManager'}));
	client.publish(	params.mqtt.prefix + 'modules_relation', JSON.stringify({from:params.mqtt.prefix + 'serial_node_msg', to:'NodeManager'}));
	client.publish(	params.mqtt.prefix + 'modules_relation', JSON.stringify({from:'NodeManager', to:params.mqtt.prefix + 'transmitUdpMsg'}));
}
