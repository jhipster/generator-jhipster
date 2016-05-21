'use strict';

/**
 * This constant is where all the error cases go.
 * No need to assign anything to the keys, the following loop will take care of
 * that.
 */
const EXCEPTIONS = {
  IllegalArgument: null,
  InvalidObject: null,
  NullPointer: null,
  WrongFile: null
};

for (let key in EXCEPTIONS) {
  EXCEPTIONS[key] = key;
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
