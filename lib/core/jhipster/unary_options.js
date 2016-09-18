'use strict';

const UNARY_OPTIONS = {
  SKIP_CLIENT: 'skipClient',
  SKIP_SERVER: 'skipServer',
  NO_FLUENT_METHOD: 'noFluentMethod'
};

function exists(option) {
  for (let definedOption in UNARY_OPTIONS) {
    if (UNARY_OPTIONS[definedOption] === option) {
      return true;
    }
  }
  return false;
}

module.exports = {
  UNARY_OPTIONS: UNARY_OPTIONS,
  exists: exists
};
