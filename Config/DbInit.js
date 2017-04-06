var winston = require('winston');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');
var migrations = require('./migrations');

module.exports = {
  initialize: function(dbFile, name, cb){
    winston.info('Starting : ' + name + ' DbInit');
    winston.info('-------------------------------------------');
		winston.info("Step 1 : Initialise database   :: " + dbFile);
    winston.info("Step 2 : At location           :: " + __dirname);

    var db = new sqlite3.Database(dbFile);
    winston.info("Step 3 : Open database at path :: " + db);
    var step = 4;
    db.serialize(function(err) {
      var migrationIndex = getCurrentMigrationIndex(db, dbFile, function(database, migrationIndex) {
        if (migrationIndex === -1) {
          winston.error('Error while creating the migrations');
          return cb();
        }
        var migrationFunctions = migrations.getList();

        if (migrationIndex !== migrationFunctions.length) {

        } else {
          winston.info('Step 4 : No migrations needed ');
          winston.info('-------------------------------------------');
      		return cb();
        }
        winston.info("Step " + step++ + " : total migrations :" + migrationFunctions.length);
        winston.info("Step " + step++ + " : start migration at :" + migrationIndex);
        winston.info("Step " + step++ + " : create migrations list")
        var migArray = [];

        for(migrationIndex; migrationIndex < migrationFunctions.length; migrationIndex++) {
          migArray.push(
            {
              func: migrationFunctions[migrationIndex].func,
              index: (migrationIndex + 1),
              name: migrationFunctions[migrationIndex].name
            });
        }

        db = database;

        async.eachLimit(migArray, 1, function(migration,callback){
          winston.info("Step " + step++ + " : Run migration with index: " + migration.index + " function : " + migration.name );
          migration.func(db, function() {
            addMigration(db, step++, migration.index, migration.name);
            callback();
          });

        }, function(err){
          if (err) {
            winston.error('Error durring database migrations :' + err);
          }
          winston.info("Step " + step++ + " : Database created      :: Success");
          winston.info('-------------------------------------------');
      		db.close();
          return cb();
        });
      });
    });
  }
}

function getCurrentMigrationIndex(db, dbFile, callback){
  var currentCount = 0;
  var database = db;
  database.all("SELECT MAX(count) as count FROM Migrations", function(err, rows) {
    if (err !== null )
    {
      if ( err.errno === 1 ) {
        var db = new sqlite3.Database(dbFile);
        db.serialize(function(err) {
          winston.error('create Migrations table');
          db.run("CREATE TABLE IF NOT EXISTS Migrations " +
                "(id        INTEGER   PRIMARY KEY   AUTOINCREMENT, " +
                "count      INTEGER, " +
                "timestamp  DATETIME, " +
                "action     CHAR(40) NOT NULL) ");
          database = db;
        });
      } else {
        winston.error('retrieving Migrations : Err:' + err);
        return callback(null, -1);
      }
      currentCount = addMigration(database, -1, currentCount, 'createMigrations');
      return callback(database, currentCount);
    }

    if (rows !== undefined && rows.length === 1)
    {
      return callback(database,rows[0].count);
    }
    else {
      return callback(null, -1);
    }
  });
}

function addMigration(db, step, count, action){
  winston.info("Step " + step + " : Insert into migration table migration : " + count);
  // Prepare and add the first migration
  var stmt = db.prepare("INSERT INTO Migrations (count, timestamp, action) VALUES (?,?,?)");
  var date = new Date();
  date.setMilliseconds(0);

  stmt.run(count ,date, action, function(err) {
    if (err)
    {
      winston.error('addMigration : ' + count + ', Err:' + err);
    }
  });
  stmt.finalize();
  return count;
}
