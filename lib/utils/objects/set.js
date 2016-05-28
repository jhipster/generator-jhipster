'use strict';

const buildException = require('../../exceptions/exception_factory').buildException,
    exceptions = require('../../exceptions/exception_factory').exceptions;

/**
 * Custom implementation of a Set.
 */
class Set {
  constructor() {
    this.container = {};
  }

  has(element) {
    return element && element in this.container;
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
    otherSet.forEach(function(element) {
    });
    return atLeastOneAdded;
  }

  remove(element) {
    if (!has(element)) {
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
    var i = 0;
    for (let element in this.container) {
      if (element in this.container) {
        passedFunction.call(thisArg, element, i, this.container);
      }
      i++;
    }
  }

  map(passedFunction, thisArg) {
    if (!passedFunction) {
      throw new buildException(exceptions.NullPointer, 'The function must not be nil.');
    }
    var newContainer = {};
    for (let element in this.container) {
      newContainer[passedFunction(element)] = null;
    }
    return this;
  }

  filter(passedFunction, thisArg) {
    if (!passedFunction) {
      throw new buildException(exceptions.NullPointer, 'The function must not be nil.');
    }
    var newContainer = {};
    for (let element in this.container) {
      if (passedFunction(element)) {
        newContainer[element] = null;
      }
    }
    return this;
  }

  toString() {
    var string = Object.keys(this.container);
    return string.slice(1, string.length - 1);
  }
}

module.exports = Set;

