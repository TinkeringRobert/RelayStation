var pjson = require('./package.json');

// External requires
var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jwt-simple');
var _ = require('lodash');
var app = express();
var winston = require('winston');
var moment = require('moment');

//{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
winston.level = 'info';

// Application settings
var isWin = /^win/.test(process.platform);
if (isWin){
  var params = require('../Gravitation/Windows');
}
else{
  var params = require('../Gravitation/Linux');
}

// Local requires
var dbInit = require('./Config/DbInit');
var modules = require('./Controllers/ModuleInit');
var nodesDb = require('./Controllers/NodesDb');

// var mdns = require('multicast-dns')()

//*******************
// 1. Parse forms & JSON in body
//*******************
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/status', function (req, res) {
  res.json({status: 'online', application: 'homecontroller'});
});

//****************
// 2. Stel middleware in voor serveren van statische bestanden (HTML, CSS, images)
//****************
app.use(express.static(__dirname + '/public'));

// routes ======================================================================
require('./Api/routes.js')(app, nodesDb);
require('./Api/meter_data.js')(app, nodesDb, params);
require('./Api/status/infra.js')(app, params);

function initialize(){
  console.log('Boot Home automation server');
  console.log(JSON.stringify(params,null,4));

  //infraRecv.initialize(params, broker);
  dbInit.initialize(params);

  modules.initialize(params);
  // mdns.on('response', function(response) {
  //   console.log('got a response packet:', response);
  // });

  // mdns.on('query', function(query) {
  //   console.log('got a query packet:', query)
  // });

  // lets query for an A record for 'brunhilde.local'
  //setInterval(sendNodeKeepAlive, 5000);
  // Activate website
  app.listen(params.application_port.relaystation, function () {
      console.log('Server gestart op poort ' + params.application_port.relaystation);
  });

  winston.info("System started");
};

initialize();

// function sendNodeKeepAlive() {
// 	winston.debug('Send hartbeat');
//   mdns.query({
//     questions:[{
//       name: 'esp8266.local',
//       type: 'A'
//     }]
//   });
// }
