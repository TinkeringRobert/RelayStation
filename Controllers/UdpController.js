var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var winston = require('winston');
var mqtt = require('mqtt');

var udp_server_initalized = false;
var recv_port = 33333;
var send_port = 22222;
var recv_host = null;
var send_host = null;

var handleUdpNodeMessage = null;
var client;
var params;

module.exports = {
  initialize: function(Params)
  {
    params = Params;

    client = mqtt.connect(params.mqtt.host);
    client.on('connect', function () {
      winston.info('Starting : UdpController');

      recv_host = params.udp_server.recv_host;
      recv_port = params.udp_server.recv_port;

      send_host = params.udp_server.send_host;
      send_port = params.udp_server.send_port;

      winston.info('Settings : Recv Host : ' + recv_host);
      winston.info('Settings : Recv Port : ' + recv_port);
      winston.info('');
      winston.info('Settings : Send Host : ' + send_host);
      winston.info('Settings : Send Port : ' + send_port);

      sendModuleRegistration(params);

      // Register the heartbeat message
      handleUdpTransmitMessage = params.mqtt.prefix + 'udp_transmit_msg';
      winston.debug('Subscribe to :: ' + handleUdpTransmitMessage);
      client.subscribe(handleUdpTransmitMessage);

      // Bind to the new server host and port
      server.bind(recv_port, recv_host);

      udp_server_initalized = true;
      winston.info('Started  : UdpController');
      winston.info('-------------------------------------------');
    });

    client.on('message', function (topic, message) {
      if (topic === handleUdpTransmitMessage) {
        transmitMsg(message);
      }
    });
  }
}

server.on('listening', function () {
    var address = server.address();
    winston.info('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    var date = new Date();
    date.setMilliseconds(0);

    // Parse the received udp message to JSON format
    var udp_res = parse_udp_message(message);

    if (udp_res !== null)
    {
      winston.info('udp received: ' + JSON.stringify(udp_res));
      udp_res.date = date;
      if(udp_res.node !== undefined){
        registerNodeRegistration(udp_res, params);

        // Transmit to message queue
        client.publish(
          params.mqtt.prefix + 'udp_node_msg',
          JSON.stringify(udp_res)
        );
      }
    }
});

server.on('error', function (err) {
  winston.error('server error: '+ err);
  server.close();
});

server.on('close', function (err) {
  winston.info('server close:');
  server.close();
  // Bind to the new server host and port
  server.bind(recv_port, recv_host);
});

function transmitMsg(msg){
  winston.debug('transmitMsg');
  if (send_host === null || udp_server_initalized === false){
    winston.error("Udp transmit message call not handled (check host and/or initialisation)");
    return;
  }

  var message = new Buffer(msg);
  var udp_client = dgram.createSocket('udp4');
  udp_client.bind();
  udp_client.on("listening", function () {
    udp_client.setBroadcast(true);

    udp_client.send(message, 0, message.length, send_port, send_host, function(err, bytes) {
        if (err) {
          udp_client.close();
          throw err;
        }
        winston.debug('UDP message sent to ' + send_host +':'+ send_port);
        udp_client.close();
    });
  });
};

function parse_udp_message(message)
{
    // Find the start and stop header for the UDP message
    // && = start
    // ## = end
    // format will be like:
    // &&{<JSON message>}##
    var start_index = message.toString().indexOf('&&');
    var end_index = message.toString().indexOf('##');

    //winston.silly('start at ' + start_index + ' end at ' + end_index);
    //var str_msg = message.toString();
    if(start_index == -1) {
        //winston.error('UDP start not found');
        return null;
    }
    if(end_index == -1) {
        //winston.error('UDP end not found');
        return null;
    }

    if(start_index > -1 && end_index > -1)
    {
        var str_msg = message.toString().substring(start_index+2, end_index);

        var received = JSON.parse(str_msg);

        if(received.node === undefined || received.node === "0000"){
          return null;
        }

        return received;
    }
    return null;
};

function sendModuleRegistration(params) {
	// Publish the channel registration
	client.publish( params.mqtt.prefix + 'module_reg', JSON.stringify({name:'UdpController', type:'application'}));

  // Outgoing queues
	client.publish(	params.mqtt.prefix + 'module_reg', JSON.stringify({name:params.mqtt.prefix + 'udp_node_msg', type:'queue'}));

  // Publish relate application to outgoing queue
	client.publish(	params.mqtt.prefix + 'modules_relation', JSON.stringify({from:'UdpController', to:params.mqtt.prefix + 'udp_node_msg'}));
}

function registerNodeRegistration(message, params) {
  client.publish( params.mqtt.prefix + 'module_reg', JSON.stringify({name:message.node, type:'node'}));
  client.publish(	params.mqtt.prefix + 'modules_relation', JSON.stringify({from:message.nodeId, to:'UdpController'}));
}
