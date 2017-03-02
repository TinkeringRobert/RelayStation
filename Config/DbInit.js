var winston = require('winston');
var sqlite3 = require('sqlite3').verbose();
var mqtt = require('mqtt');

var client;

module.exports = {
  initialize: function(params){

    winston.info('Starting : dbInit');
    winston.info('-------------------------------------------');
    winston.info("Step 1 : Initialise database   :: " + params.database.nodes);
    winston.info("Step 2 : At location           :: " + __dirname);

    var db = new sqlite3.Database(params.database.nodes);
    winston.info("Step 3 : Open database at path :: " + db);


    db.serialize(function(err) {
      winston.info("Step 4 : Serialize database    :: " + (err!==undefined ? err : "Success"));
      if(err !== undefined){
        winston.error("err :" + err);
      }
      winston.info("Step 5 : Seed the database     :: " + (err!==undefined ? err : "Success"));
      addControllers(db);
      winston.info("Step 5 : Seed the database     :: " + (err!==undefined ? err : "Success"));
      addNetworkNode(db);
      winston.info("Step 5 : Seed the database     :: " + (err!==undefined ? err : "Success"));
      addBatteryNode(db);
      winston.info("Step 5 : Seed the database     :: " + (err!==undefined ? err : "Success"));
      addTemperatureNode(db);
      winston.info("Step 5 : Seed the database     :: " + (err!==undefined ? err : "Success"));
      addHumidityNode(db);
      winston.info("Step 5 : Seed the database     :: " + (err!==undefined ? err : "Success"));
      addEnergyMeterDb(db);
      winston.info("Step 5 : Seed the database     :: " + (err!==undefined ? err : "Success"));
    });
    winston.info("Step 6 : Close database file   :: Success");
    db.close();
    winston.info("Step 7 : Database created      :: Success");

    var client = mqtt.connect(params.mqtt.host);

    client.on('connect', function () {
      winston.info('Report DbInit to infrastructure');
      client.publish(params.mqtt.prefix + 'module_reg', JSON.stringify({name:'NodesDbInit', type:'application'}));
      client.end();
    });
  }
}

// -------------------------------------------------
// Database table creators
// -------------------------------------------------
function addControllers(db){
  winston.info("Add controllers database table");

  db.run("CREATE TABLE IF NOT EXISTS controllers " +
        "(id             INTEGER   PRIMARY KEY   AUTOINCREMENT, " +
        "controller_name CHAR(255) NOT NULL, " +
        "last_seen       DATETIME, " +
        "first_seen      DATETIME) ");

  //db.run("ALTER TABLE controllers ADD COLUMN first_seen DATETIME");
}

function addNetworkNode(db){
  winston.info("Add network_node database table");

  db.run("CREATE TABLE IF NOT EXISTS network_node " +
        "(id        INTEGER            PRIMARY KEY   AUTOINCREMENT, " +
        "node_id    CHAR(4)   NOT NULL, " +
        "last_seen  DATETIME)");

  //db.run("ALTER TABLE network_node ADD COLUMN node_name CHAR(16)");
  //db.run("ALTER TABLE network_node ADD COLUMN first_seen DATETIME");
}

function addBatteryNode(db){
  winston.info("Add battery_node database table");

  db.run("CREATE TABLE IF NOT EXISTS battery_node " +
        "(id       INTEGER            PRIMARY KEY   AUTOINCREMENT, " +
        "node_id   CHAR(4)   NOT NULL, " +
        "timestamp DATETIME, " +
        "value     REAL)");
}

function addTemperatureNode(db){
  winston.info("Add temperature_node database table");
  db.run("CREATE TABLE IF NOT EXISTS temperature_node " +
        "(id       INTEGER            PRIMARY KEY   AUTOINCREMENT, " +
        "node_id   CHAR(4)   NOT NULL, " +
        "timestamp DATETIME, " +
        "value     REAL)");
}

function addHumidityNode(db){
  winston.info("Add humidity_node database table");
  db.run("CREATE TABLE IF NOT EXISTS humidity_node " +
        "(id       INTEGER            PRIMARY KEY   AUTOINCREMENT, " +
        "node_id   CHAR(4)   NOT NULL, " +
        "timestamp DATETIME, " +
        "value     REAL)");
}

function addEnergyMeterDb(db){
  winston.info("Add energy_meter database table");
  db.run("CREATE TABLE IF NOT EXISTS energy_meter " +
        "(id       INTEGER            PRIMARY KEY   AUTOINCREMENT, " +
        "node_id   CHAR(4)   NOT NULL, " +
        "timestamp DATETIME, " +
        "kwh_meter REAL," +
        "hh_meter  REAL," +
        "pv_meter  REAL)");
}
