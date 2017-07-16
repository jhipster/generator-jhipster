

/**
 * This constant is where all the error cases go.
 * No need to assign anything to the keys, the following loop will take care of
 * that.
 */
const EXCEPTIONS = {
  Assertion: null,
  FileNotFound: null,
  IllegalArgument: null,
  IllegalAssociation: null,
  IllegalName: null,
  IllegalOption: null,
  InvalidObject: null,
  MalformedAssociation: null,
  NoSQLModeling: null,
  NullPointer: null,
  UndeclaredEntity: null,
  UnsupportedOperation: null,
  WrongAssociation: null,
  WrongFile: null,
  WrongDir: null,
  WrongType: null,
  WrongValidation: null
};

Object.keys(EXCEPTIONS).forEach((key) => {
  EXCEPTIONS[key] = key;
});

module.exports = {
  exceptions: EXCEPTIONS,
  BuildException
};

function BuildException(name, message) {
  const exception = {
    name: name ? `${name}Exception` : 'Exception',
    message: (message || '')
  };
  exception.prototype = new Error();
  return exception;
}
