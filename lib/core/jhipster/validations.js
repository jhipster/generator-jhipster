'use strict';

const VALIDATIONS = {
  REQUIRED: 'required',
  MIN: 'min',
  MAX: 'max',
  MINLENGTH: 'minlength',
  MAXLENGTH: 'maxlength',
  PATTERN: 'pattern',
  MINBYTES: 'minbytes',
  MAXBYTES: 'maxbytes'
};

const VALUED = {
  required: false,
  min: true,
  max: true,
  minlength: true,
  maxlength: true,
  pattern: true,
  minbytes: true,
  maxbytes: true
};

function exists(validation) {
  for (let definedValidation in VALIDATIONS) {
    if (VALIDATIONS[definedValidation] === validation) {
      return true;
    }
  }
  return false;
}

function needsValue(validation) {
  return VALUED[validation];
}

module.exports = {
  VALIDATIONS: VALIDATIONS,
  exists: exists,
  needsValue: needsValue
};
