'use strict';

const fs = require('fs'),
    jdlParser = require('../dsl/jdl_parser'),
    DSLParser = require('./entity_parser'),
    EntitiesCreator = require('./entity_creator'),
    initDatabaseTypeHolder = require('../types/types_helper').initDatabaseTypeHolder,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  parse: parse,
  parseFromFiles: parseFromFiles,
  convertToEntityJson: convertToEntityJson
};

/* Parse the given content and return an intermediate object */
function parse(content) {
  if (!content || content.length === 0) {
    throw new buildException(
        exceptions.IllegalArgument, 'The content must be passed.');
  }
  return jdlParser.parse(content);
}

/* Parse the given files and return an intermediate object */
function parseFromFiles(files) {
  if (!files || files.length === 0) {
    throw new buildException(
        exceptions.IllegalArgument, 'The file/s must be passed.');
  }
  checkAllTheFilesAreJDLFiles(files);
  return parse(files.length === 1
      ? readFileContent(files[0])
      : aggregateFiles(files));
}

/* Convert the given intermediate object to JHipster compatible enity JSON array */
function convertToEntityJson(contentObj, databaseType, force) {
    var databaseTypes = initDatabaseTypeHolder(databaseType);
    var parser = new DSLParser(contentObj, databaseTypes);
    var parsedData = parser.parse();
    var scheduledClasses = parsedData.classes;
    if (parsedData.userClassId) {
        scheduledClasses = filterScheduledClasses(parsedData.userClassId, scheduledClasses);
    }

    var creator = new EntitiesCreator(parsedData, parser.databaseTypes);

    creator.createEntities();
    if (!force) {
        scheduledClasses = creator.filterOutUnchangedEntities(scheduledClasses);
    }
    return creator.getEntitiesMap(scheduledClasses);
}

/* private methods */

function checkAllTheFilesAreJDLFiles(files) {
  for (let i = 0; i < files.length; i++) {
    checkFileIsJDLFile(files[i]);
  }
}

function checkFileIsJDLFile(file) {
  if (file.slice(file.length - 3, file.length) !== '.jh'
      && file.slice(file.length - 4, file.length) !== '.jdl') {
    throw new buildException(
        exceptions.WrongFile,
        `The passed file '${file}' must end with '.jh' or '.jdl' to be valid.`);
  }
}

function aggregateFiles(files) {
  var content = '';
  for (let i = 0; i < files.length; i++) {
    content = content + '\n' + readFileContent(files[i]);
  }
  return content;
}

function readFileContent(file) {
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    throw new buildException(
        exceptions.WrongFile,
        `The passed file '${file}' must exist and must not be a directory.`);
  }
  return fs.readFileSync(file, 'utf-8').toString();
}

function filterScheduledClasses(classToFilter, scheduledClasses) {
    return scheduledClasses.filter(function(element) {
        return element !== classToFilter;
    });
}
