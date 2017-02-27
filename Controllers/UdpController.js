var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var winston = require('winston');
var broker;
var params;
//{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
var count = 0;

var udp_server_initalized = false;
var recv_port = 33333;
var send_port = 22222;
var recv_host = null;
var send_host = null;

module.exports = {
  initialize: function(Params, Broker)
  {
    broker = Broker;
    console.log('Starting : UdpController');

    recv_host = params.udp_server.recv_host;
    recv_port = params.udp_server.recv_port;

    send_host = params.udp_server.send_host;
    send_port = params.udp_server.send_port;

    console.log('Settings : Recv Host : ' + recv_host);
    console.log('Settings : Recv Port : ' + recv_port);
    console.log('');
    console.log('Settings : Send Host : ' + send_host);
    console.log('Settings : Send Port : ' + send_port);

    broker.subscribe('transmitMsg', function(event, payload) {
      transmitMsg(payload.udpMsg);
    });

    // Bind to the new server host and port
    server.bind(recv_port, recv_host);

    udp_server_initalized = true;
    console.log('Started  : UdpController');
    console.log('-------------------------------------------');
    broker.publish('ReportController',
                  {controllerName: 'UdpController'},
                  {async: false});
  }
}

server.on('listening', function () {
    var address = server.address();
    winston.info('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    var date = new Date();
    date.setMilliseconds(0);
    //winston.debug(date.toLocaleString() + ' at recv:' + remote.address + ':' + remote.port +' - ' + message);
    //winston.debug(remote);

    // Parse the received udp message to JSON format
    var udp_res = parse_udp_message(message);

    //winston.info('test transmit function');

    if (udp_res !== null)
    {
      //winston.info('received: ' + JSON.stringify(udp_res));
      udp_res.date = date;

      broker.publish('handleUdpNodeMessage',
                     {udpMsg: udp_res},
                     {async: true});
      // node.handleUdpNodeMessage(udp_res, date);
    }
});

server.on('error', function (err) {
  winston.error('server error: '+ err);
  server.close();
});

server.on('close', function (err) {
  console.log('server close:');
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
  var client = dgram.createSocket('udp4');
  client.bind();
  client.on("listening", function () {
    client.setBroadcast(true);

    client.send(message, 0, message.length, send_port, send_host, function(err, bytes) {
        if (err) {
          client.close();
          throw err;
        }
        console.log('UDP message sent to ' + send_host +':'+ send_port);
        client.close();
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
        //winston.silly('Message substring');

        var str_msg = message.toString().substring(start_index+2, end_index);

        //winston.silly(str_msg);

        var received = JSON.parse(str_msg);
        if(received.node === undefined || received.node === "0000"){
          return null;
        }

        //winston.silly('Parsed to JSON');
        //winston.silly(received);
        return received;
    }
    return null;
};
