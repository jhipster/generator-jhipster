'use strict';

var fs = require('fs'),
    jdlParser = require('../dsl/jdl_parser'),
    IllegalArgumentException = require('../exceptions/illegal_argument_exception'),
    WrongFileException = require('../exceptions/wrong_file_exception');

module.exports = {
    read: readContent,
    readFiles: readFiles
};

function readFiles(files) {
  if (!files || files.length === 0) {
    throw new IllegalArgumentException('The file/s must be passed.');
  }
  checkAllTheFilesAreJDLFiles(files);
  return readContent(files.length === 1 ? readFileContent(files[0]) : aggregateFiles(files));
};

function readContent(content) {
  if (!content || content.length === 0) {
    throw new IllegalArgumentException('The content must be passed.');
  }
  return jdlParser.parse(content);
};

function checkAllTheFilesAreJDLFiles(files) {
  for (var i = 0; i < files.length; i++) {
    checkFileIsJDLFile(files[i]);
  }
}

function checkFileIsJDLFile(file) {
  if (file.slice(file.length - 3, file.length) !== '.jh'
      && file.slice(file.length - 4, file.length) !== '.jdl') {
    throw new WrongFileException(
        "The passed file '"
        + file
        + "' must end with '.jh' or '.jdl' to be valid.");
  }
}

function aggregateFiles(files) {
  var content = '';
  for (var i = 0; i < files.length; i++) {
    content = content + '\n' + readFileContent(files[i]);
  }
  return content;
}

function readFileContent(file) {
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    throw new WrongFileException(
        "The passed file '"
        + file
        + "' must exist and must not be a directory.'");
  }
  return fs.readFileSync(file, 'utf-8').toString();
}
