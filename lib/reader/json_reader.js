

const _ = require('lodash');
const fs = require('fs');
const Parser = require('../parser/json_parser');
const Reader = require('../reader/json_file_reader');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  parseFromDir
};

/* Parse the given jhipster app dir and return a JDLObject */
function parseFromDir(dir) {
  let isDir = false;
  if (!dir) {
    throw new BuildException(
      exceptions.IllegalArgument, 'The app directory must be passed.');
  }
  try {
    isDir = fs.statSync(dir).isDirectory();
  } catch (error) { // doesn't exist
    isDir = false;
  }
  if (!isDir) {
    throw new BuildException(
      exceptions.WrongDir,
      'The passed dir must exist and must be a directory.');
  }
  const jdl = Parser.parseServerOptions(Reader.readEntityJSON(`${dir}/.yo-rc.json`)['generator-jhipster']);
  const entityDir = `${dir}/.jhipster`;
  let isJhipsterDirectory = false;
  try {
    isJhipsterDirectory = fs.statSync(entityDir).isDirectory();
  } catch (error) {
    // .jhipster dir doesn't exist'
    return jdl;
  }
  if (!isJhipsterDirectory) {
    throw new BuildException(
      exceptions.WrongDir,
      `'${entityDir}' must be a directory.`);
  }
  const entities = {};
  _.forEach(fs.readdirSync(entityDir), (file) => {
    if (file.slice(file.length - 5, file.length) === '.json') {
      const entityName = file.slice(0, file.length - 5);
      try {
        entities[entityName] = Reader.readEntityJSON(`${entityDir}/${file}`);
      } catch (error) {
        // Not an entity file, not adding
      }
    }
  });
  Parser.parseEntities(entities, jdl);
  return jdl;
}
