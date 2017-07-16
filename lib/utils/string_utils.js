

const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  isNilOrEmpty,
  camelCase
};

function isNilOrEmpty(string) {
  return string == null || string === '';
}

function camelCase(string) {
  if (string == null) {
    throw new BuildException(exceptions.NullPointer, 'The passed string cannot be nil.');
  }
  if (string === '') {
    return string;
  }
  string = string.replace(/[\W_]/g, '');
  return `${string[0].toLowerCase()}${string.slice(1, string.length)}`;
}
