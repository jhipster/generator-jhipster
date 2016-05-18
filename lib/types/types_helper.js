'use strict';

const MongoDBTypes = require('./mongodb_types'),
  CassandraTypes = require('./cassandra_types'),
  SQLTypes = require('./sql_types');

/**
 * Returns true if type is an instance of a NoSQL database type.
 * @param {type} the type to check.
 * @return {boolean} whether the passed type is of a NoSQL type.
 */
exports.isNoSQL = function (type) {
  return !SQLTypes.prototype.isPrototypeOf(type);
};

exports.initDatabaseTypeHolder = function(databaseTypeName) {
    switch (databaseTypeName) {
    case 'mongodb':
        return new MongoDBTypes();
    case 'cassandra':
        return new CassandraTypes();
    default:
        return new SQLTypes();
    }
};
