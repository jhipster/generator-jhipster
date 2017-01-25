'use strict';

const buildException = require('../../exceptions/exception_factory').buildException,
  exceptions = require('../../exceptions/exception_factory').exceptions;

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
      throw new buildException(exceptions.NullPointer, "Can't add a nil element to the set.");
    }
    if (element in this.container) {
      return false;
    }
    this.container[element] = null;
    return true;
  }

  addArrayElements(array) {
    if (!array) {
      throw new buildException(exceptions.NullPointer, "Can't add elements from a nil object.");
    }
    var atLeastOneAdded = false;
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
      throw new buildException(exceptions.NullPointer, "Can't add elements from a nil object.");
    }
    var atLeastOneAdded = false;
    for (let element in otherSet.container) {
      if (otherSet.container.hasOwnProperty(element)) {
        let added = this.add(element);
        if (added) {
          atLeastOneAdded = true;
        }
      }
    }
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
      throw new buildException(exceptions.NullPointer, 'The function must not be nil.');
    }
    for (let element in this.container) {
      if (element in this.container) {
        passedFunction.call(thisArg, element);
      }
    }
  }

  map(passedFunction, thisArg) {
    if (!passedFunction) {
      throw new buildException(exceptions.NullPointer, 'The function must not be nil.');
    }
    var newContainer = {};
    for (let element in this.container) {
      if (element in this.container) {
        newContainer[passedFunction.call(thisArg, element)] = null;
      }
    }
    this.container = newContainer;
    return this;
  }

  filter(passedFunction, thisArg) {
    if (!passedFunction) {
      throw new buildException(exceptions.NullPointer, 'The function must not be nil.');
    }
    var newContainer = {};
    for (let element in this.container) {
      if (element in this.container && passedFunction.call(thisArg, element)) {
        newContainer[element] = null;
      }
    }
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
  var map = {};
  for (let i = 0; i < array.length; i++) {
    map[array[i]] = null;
  }
  return map;
}
