'use strict';

const buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

/**
 * This interface provides base methods for handling the types.
 */
var Types = module.exports = function () {
};

/**
 * Must be implemented by subclasses.
 * Returns the type list.
 * @return {Array} the type list.
 * @throws UnimplementedOperationException if the method has not been
 *                                         implemented by the subclass.
 */
Types.prototype.getTypes = function () {
  throw new buildException(
      exceptions.UnimplementedOperation,
      'This method must be implemented by a subclass to be called.');
};

/**
 * Must be implemented by subclasses.
 * Returns the validations for the passed type.
 * @param type {string} the type.
 * @return {Array} the validation list.
 * @throws UnimplementedOperationException if the method has not been
 *                                         implemented by the subclass.
 * @throws NoElementFoundException if no type exists for the passed type.
 */
Types.prototype.getValidationsForType = function (type) {
  throw new buildException(
      exceptions.UnimplementedOperation,
      'This method must be implemented by a subclass to be called.');
};

/**
 * This method converts the internal type map into another array.
 * Each element is an Object which has a name, and a value.
 * By default, the name and the value keys have the same value:
 * [ { name: '1', value: '1' }, { name: '2', value: '2' }, ... ]
 * @return {Array} the new array.
 */
Types.prototype.toValueNameObjectArray = function () {
  var array = [];
  for (let key in this.getTypes()) {
    if (this.getTypes().hasOwnProperty(key)) {
      let object = {
        value: this.getTypes()[key],
        name: this.getTypes()[key]
      };
      array.push(object);
    }
  }
  return array;
};

/**
 * Checks whether the type is contained in the supported types.
 * @param {string} type the type to check.
 * @return {boolean} whether the type is contained in the supported types.
 */
Types.prototype.contains = function (type) {
  return this.getTypes().indexOf(type) !== -1;
};

/**
 * Checks whether the type possesses the also passed validation.
 * @param type {string} the type.
 * @param validation {string} the validation to check.
 * @return {boolean} whether the type is validated by the validation.
 * @throws NoElementFoundException if no type exists for the passed type.
 */
Types.prototype.isValidationSupportedForType = function (type, validation) {
  return this.getValidationsForType(type).indexOf(validation) !== -1;
};
