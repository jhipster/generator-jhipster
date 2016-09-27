'use strict';

const fs = require('fs'),
  Parser = require('../parser/json_parser'),
  Reader = require('../reader/json_file_reader'),
  buildException = require('../exceptions/exception_factory').buildException,
  exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  parseFromDir: parseFromDir
};

/* Parse the given jhipster app dir and return a JDLObject */
function parseFromDir(dir) {
  var isDir = false;
  if (!dir) {
    throw new buildException(
        exceptions.IllegalArgument, 'The app directory must be passed.');
  }
  try {
    isDir = fs.statSync(dir).isDirectory();
  } catch (error) { // doesn't exist
    isDir = false;
  }
  if (!isDir) {
    throw new buildException(
        exceptions.WrongDir,
        `The passed dir must exist and must be a directory.`);
  }
  var jdl = Parser.parseServerOptions(Reader.readEntityJSON(dir + '/.yo-rc.json'));
  var entityDir = dir + '/.jhipster';
  var isJhipsterDirectory = false;
  try {
    isJhipsterDirectory = fs.statSync(entityDir).isDirectory();
  } catch (error) {
    // .jhipster dir doesn't exist'
    return jdl;
  }
  if (!isJhipsterDirectory) {
    throw new buildException(
        exceptions.WrongDir,
        `'${entityDir}' must be a directory.`);
  }
  var entities = {};
  fs.readdirSync(entityDir).forEach(function(file) {
    if(file.slice(file.length - 5, file.length) === '.json') {
      var entityName = file.slice(0, file.length - 5);
      try {
        entities[entityName] = Reader.readEntityJSON(entityDir + '/' + file);
      } catch (error) {
        // Not an entity file, not adding
      }
    }
  });
  Parser.parseEntities(entities, jdl);
  return jdl;
}
