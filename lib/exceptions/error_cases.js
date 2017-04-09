const ERROR_CASES = {
  entities: {
    NoEntity: 'No entity',
    NoName: 'No entity name',
    NoTableName: 'No table name',
    NoFields: 'No fields object'
  },
  fields: {
    NoField: 'No field',
    NoName: 'No field name',
    NoType: 'No field type'
  },
  validations: {
    NoValidation: 'No validation',
    NoName: 'No validation name',
    WrongValidation: 'Wrong validation',
    NoValue: 'No value'
  },
  enums: {
    NoEnum: 'No enumeration',
    NoName: 'No enumeration name'
  }
};

module.exports = {
  ErrorCases: ERROR_CASES
};
