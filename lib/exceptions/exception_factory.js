/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
