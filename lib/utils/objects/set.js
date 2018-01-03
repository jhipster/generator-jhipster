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

const BuildException = require('../../exceptions/exception_factory').BuildException;
const exceptions = require('../../exceptions/exception_factory').exceptions;

/**
 * Custom implementation of a Set.
 */
class Set {
  constructor(array) {
    this.container = array ? convertToMap(array) : {};
  }

  has(element) {
    return element != null && element in this.container;
  }

  add(element) {
    if (!element) {
      throw new BuildException(exceptions.NullPointer, 'Can\'t add a nil element to the set.');
    }
    if (element in this.container) {
      return false;
    }
    this.container[element] = null;
    return true;
  }

  addArrayElements(array) {
    if (!array) {
      throw new BuildException(exceptions.NullPointer, 'Can\'t add elements from a nil object.');
    }
    let atLeastOneAdded = false;
    for (let i = 0; i < array.length; i++) {
      if (!this.has(array[i])) {
        this.container[array[i]] = null;
        atLeastOneAdded = true;
      }
    }
    return atLeastOneAdded;
  }

  addSetElements(otherSet) {
    if (!otherSet) {
      throw new BuildException(exceptions.NullPointer, 'Can\'t add elements from a nil object.');
    }
    let atLeastOneAdded = false;
    Object.keys(otherSet.container).forEach((element) => {
      const added = this.add(element);
      if (added) {
        atLeastOneAdded = true;
      }
    });
    return atLeastOneAdded;
  }

  remove(element) {
    if (!this.has(element)) {
      return false;
    }
    delete this.container[element];
    return true;
  }

  clear() {
    this.container = {};
  }

  size() {
    return Object.keys(this.container).length;
  }

  forEach(passedFunction, thisArg) {
    if (!passedFunction) {
      throw new BuildException(exceptions.NullPointer, 'The function must not be nil.');
    }
    Object.keys(this.container).forEach((element) => {
      passedFunction.call(thisArg, element);
    });
  }

  map(passedFunction, thisArg) {
    if (!passedFunction) {
      throw new BuildException(exceptions.NullPointer, 'The function must not be nil.');
    }
    const newContainer = {};
    Object.keys(this.container).forEach((element) => {
      newContainer[passedFunction.call(thisArg, element)] = null;
    });
    this.container = newContainer;
    return this;
  }

  filter(passedFunction, thisArg) {
    if (!passedFunction) {
      throw new BuildException(exceptions.NullPointer, 'The function must not be nil.');
    }
    const newContainer = {};
    Object.keys(this.container).forEach((element) => {
      if (passedFunction.call(thisArg, element)) {
        newContainer[element] = null;
      }
    });
    this.container = newContainer;
    return this;
  }

  join(delimiter) {
    return Object.keys(this.container).join((!delimiter) ? ',' : delimiter);
  }

  toString() {
    return `[${Object.keys(this.container).toString()}]`;
  }
}

module.exports = Set;

function convertToMap(array) {
  const map = {};
  for (let i = 0; i < array.length; i++) {
    map[array[i]] = null;
  }
  return map;
}
