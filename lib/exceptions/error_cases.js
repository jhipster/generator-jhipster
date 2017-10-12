const ERROR_CASES = {
  entities: {
    NoEntity: 'No entity',
    NoName: 'No entity name',
    NoTableName: 'No table name',
    NoFields: 'No fields object',
    ReservedWordAsName: 'The entity name cannot be a reserved keyword',
    ReservedWordAsTableName: 'The entity table name cannot be a reserved keyword'
  },
  fields: {
    NoField: 'No field',
    NoName: 'No field name',
    NoType: 'No field type',
    ReservedWordAsName: 'The field name cannot be a reserved keyword'
  },
  validations: {
    NoValidation: 'No validation',
    NoName: 'No validation name',
    WrongValidation: 'Wrong validation',
    NoValue: 'No value'
  },
  enums: {
    NoEnum: 'No enumeration',
    NoName: 'No enumeration name',
    ReservedWordAsName: 'The enum name cannot be a reserved keyword'
  },
  relationships: {
    NoRelationship: 'No relationship',
    WrongType: 'Wrong type',
    WrongFromSide: 'Wrong source entity',
    WrongToSide: 'Wrong destination entity',
    DeclarationError: 'Declaration error (no injected field in both sides)'
  },
  options: {
    NoOption: 'No option',
    NoName: 'No option name',
    NoEntityNames: 'No entity names',
    NilInEntityNames: 'Nil value in entity names',
    NoExcludedNames: 'No excluded names',
    NilInExcludedNames: 'Nil value in excluded names',
    NoType: 'No type'
  }
};

module.exports = {
  ErrorCases: ERROR_CASES
};
