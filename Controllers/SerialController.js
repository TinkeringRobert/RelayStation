var SerialPort = require("serialport");
var validator = require('validator');
var winston = require('winston');
var mqtt = require('mqtt');

var client;
var port;

module.exports = {
  initialize: function(params)
  {
    client = mqtt.connect(params.mqtt.host);
    client.on('connect', function () {
      winston.info('Starting : SerialController');
      winston.info('Settings : name_port : ' + params.serial_port.name_port);
      winston.info('Settings : baudrate  : ' + params.serial_port.baud_rate);

      sendModuleRegistration(params);

      port = new SerialPort(
        params.serial_port.name_port, {
          baudRate: params.serial_port.baud_rate,
          parser: SerialPort.parsers.readline('\n')
        }
      );

      port.on('close', function (err) {
        winston.info('Serial port closed ' + params.serial_port.name_port);
        if (err) {
          return winston.error('Serial port closed: ', err.message);
        }
      });

      port.on('disconnect', function (err) {
        winston.info('Serial port disconnect ' + params.serial_port.name_port);
        if (err) {
          return winston.error('Serial port disconnected: ', err.message);
        }
      });

      port.on('error', function(err) {
        winston.error('Error: ', err.message);
      });

      port.open(function (err) {
        if (err) {
          return winston.error('Error: opening port: ', err.message);
        }

        winston.info('Started  : SerialController');
        winston.info('-------------------------------------------');

        port.on('data', function(message) {
          var date = new Date();
          date.setMilliseconds(0);

          parse_serial_msg(message, function(message){
            if (message !== null && message !== undefined){
              var sen_msg = JSON.parse(message);
              winston.info('ser received: ' + JSON.stringify(sen_msg));
              sen_msg.date = date;
              if(sen_msg.nodeId !== undefined){
                registerNodeRegistration(sen_msg, params);

                // Transmit to message queue
                client.publish(
                  params.mqtt.prefix + 'serial_node_msg',
                  JSON.stringify(sen_msg)
                );
              }
            }
          });
        });
      });
    });
  }
}

function parse_serial_msg(message, callback){
  if (validator.isJSON(message)){
    //winston.silly("Serial message is a valid JSON format");
    return callback(message);
  }

  //winston.silly("Serial message is not a JSON message");
  var start_index = message.toString().indexOf('&&');
  var end_index = message.toString().indexOf('##');

  if(start_index == -1) {
    //winston.debug('Serial msg start not found');
    return callback(null);
  }
  if(end_index == -1) {
    //winston.debug('Serial msg end not found');
    return callback(null);
  }

  if(start_index > -1 && end_index > -1)
  {
    //winston.silly('Serial msg substring');
    var str_msg = message.toString().substring(start_index+2, end_index);
    //winston.silly(str_msg);
    if (validator.isJSON(str_msg)){
      //winston.silly("Serial message is a valid JSON format");
      return callback(str_msg);
    }
  }
}

function sendModuleRegistration(params) {
	// Publish the channel registration
	client.publish( params.mqtt.prefix + 'module_reg', JSON.stringify({name:'SerialController', type:'application'}));

  // Outgoing queues
	client.publish(	params.mqtt.prefix + 'module_reg', JSON.stringify({name:params.mqtt.prefix + 'serial_node_msg', type:'queue'}));

  // Publish relate application to outgoing queue
	client.publish(	params.mqtt.prefix + 'modules_relation', JSON.stringify({from:'SerialController', to:params.mqtt.prefix + 'serial_node_msg'}));
}

function registerNodeRegistration(message, params) {
  client.publish( params.mqtt.prefix + 'module_reg', JSON.stringify({name:message.nodeId, type:'node'}));
  client.publish(	params.mqtt.prefix + 'modules_relation', JSON.stringify({from:message.nodeId, to:'SerialController'}));
}
