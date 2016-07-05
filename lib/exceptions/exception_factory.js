'use strict';

/**
 * This constant is where all the error cases go.
 * No need to assign anything to the keys, the following loop will take care of
 * that.
 */
const EXCEPTIONS = {
  Assertion: null,
  IllegalArgument: null,
  InvalidObject: null,
  FileNotFound: null,
  MalformedAssociation: null,
  NoSQLModeling: null,
  NullPointer: null,
  UndeclaredEntity: null,
  UnsupportedOperation: null,
  WrongAssociation: null,
  WrongFile: null,
  WrongType: null,
  WrongValidation: null
};

for (let key in EXCEPTIONS) {
  if (EXCEPTIONS.hasOwnProperty(key)) {
    EXCEPTIONS[key] = key;
  }
}

module.exports = {
  exceptions: EXCEPTIONS,
  buildException: buildException
};

function buildException(name, message) {
  var exception = {
    name: name ? `${name}Exception` : 'Exception',
    message: (message || '')
  };
  exception.prototype = new Error();
  return exception;
}
