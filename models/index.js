var fs = require("fs");
var path = require("path");
var basename  = path.basename(__filename);
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development',
    config = require('./../config/config.' + env);
var db = {};

var sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, config.db.sequelizeParams);

// load models

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

//Sync Database
sequelize.sync().then(function() {
    console.log('Nice! Database looks fine');
}).catch(function(err) {
    console.log(err, "Something went wrong with the Database Update!");
});

// exports
db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;
