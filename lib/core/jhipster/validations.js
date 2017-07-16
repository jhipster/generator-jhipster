

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
  return Object.keys(VALIDATIONS).map(key => VALIDATIONS[key]).includes(validation);
}

function needsValue(validation) {
  return VALUED[validation];
}

module.exports = {
  VALIDATIONS,
  exists,
  needsValue
};
