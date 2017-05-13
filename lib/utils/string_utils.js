'use strict';

const buildException = require('../exceptions/exception_factory').buildException,
  Exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  isNilOrEmpty: isNilOrEmpty,
  camelCase: camelCase
};

function isNilOrEmpty(string) {
  return !string || string === '';
}

function camelCase(string) {
  if (string === null || string === undefined) {
    throw new buildException(Exceptions.NullPointer, 'The passed string cannot be nil.');
  }
  if (string === '') {
    return string;
  }
  string = string.replace(/[\W_]/g, '');
  return `${string[0].toLowerCase()}${string.slice(1, string.length)}`;
}
