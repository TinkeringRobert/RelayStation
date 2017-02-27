var SerialPort = require("serialport");
var validator = require('validator');
var winston = require('winston');

module.exports = {
  initialize: function(params,Broker)
  {
    broker = Broker;
    console.log('Starting : SerialController');

    console.log('Settings : name_port : ' + params.serial_port.name_port);
    console.log('Settings : baudrate  : ' + params.serial_port.baud_rate);
    broker.publish('ReportController',
                  {controllerName: 'SerialController'},
                  {async: false});

    var port = new SerialPort(
      params.serial_port.name_port, {
        baudRate: params.serial_port.baud_rate,
        parser: SerialPort.parsers.readline('\n')
      }
    );

    port.close(function (err) {
      if (err) {
        //return console.log('Error closing port: ', err.message);
      }
    });

    port.open(function (err) {
      if (err) {
        return console.log('Error opening port: ', err.message);
      }
    });

    console.log('Started  : SerialController');
    console.log('-------------------------------------------');

    port.on('data', function(message) {
      var date = new Date();
      date.setMilliseconds(0);

      //winston.debug("Message ::" + message.toString() + "::");
      parse_serial_msg(message, function(message){
        //winston.debug("Result == " + message);

        if (message !== null && message !== undefined){
          var sen_msg = JSON.parse(message);
          sen_msg.date = date;
          if(sen_msg.nodeId !== undefined){
            broker.publish('handleSerialNodeMessage',
                          {serialMsg: sen_msg},
                          {async: true});
          }
        }
      });
    });

    port.on('error', function(err) {
      console.log(err);
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
