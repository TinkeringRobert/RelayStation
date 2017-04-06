module.exports = {
  getList: function() {
    return [
      {func:this.addControllers, name:"addControllers"},
      {func:this.addNetworkNode, name:"addNetworkNode"},
      {func:this.addBatteryNode, name:"addBatteryNode"},
      {func:this.addHumidityNode, name:"addHumidityNode"},
      {func:this.addEnergyMeterDb, name:"addEnergyMeterDb"},
      {func:this.addTemperatureNode, name:"addTemperatureNode"}
    ];
  },

  addControllers: function(db, cb){
    db.run("CREATE TABLE IF NOT EXISTS controllers " +
          "(id             INTEGER   PRIMARY KEY   AUTOINCREMENT, " +
          "controller_name CHAR(255) NOT NULL, " +
          "last_seen       DATETIME, " +
          "first_seen      DATETIME) ");
    cb();
  },

  addNetworkNode: function(db, cb){
    db.run("CREATE TABLE IF NOT EXISTS network_node " +
          "(id        INTEGER   PRIMARY KEY   AUTOINCREMENT, " +
          "node_id    CHAR(4)   NOT NULL, " +
          "last_seen  DATETIME)");
    cb();
  },

  addBatteryNode: function(db, cb){
    db.run("CREATE TABLE IF NOT EXISTS battery_node " +
          "(id       INTEGER   PRIMARY KEY   AUTOINCREMENT, " +
          "node_id   CHAR(4)   NOT NULL, " +
          "timestamp DATETIME, " +
          "value     REAL)");
    cb();
  },

  addTemperatureNode: function(db, cb){
    db.run("CREATE TABLE IF NOT EXISTS temperature_node " +
          "(id       INTEGER   PRIMARY KEY   AUTOINCREMENT, " +
          "node_id   CHAR(4)   NOT NULL, " +
          "timestamp DATETIME, " +
          "value     REAL)");
    cb();
  },

  addHumidityNode: function(db, cb){
    db.run("CREATE TABLE IF NOT EXISTS humidity_node " +
          "(id       INTEGER            PRIMARY KEY   AUTOINCREMENT, " +
          "node_id   CHAR(4)   NOT NULL, " +
          "timestamp DATETIME, " +
          "value     REAL)");
    cb();
  },

  addEnergyMeterDb: function(db, cb){
    db.run("CREATE TABLE IF NOT EXISTS energy_meter " +
          "(id       INTEGER            PRIMARY KEY   AUTOINCREMENT, " +
          "node_id   CHAR(4)   NOT NULL, " +
          "timestamp DATETIME, " +
          "kwh_meter REAL," +
          "hh_meter  REAL," +
          "pv_meter  REAL)");
    cb();
  }
}
