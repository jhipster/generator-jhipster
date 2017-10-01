const ERROR_CASES = {
  applications: {
    NoApplication: 'No application',
    NoName: 'No name',
    NoVersion: 'No generator version',
    NoPackageNameOrFolder: 'No package name or folder',
    NoAuthenticationType: 'No authentication type',
    NoHibernateCache: 'No Hibernate cache',
    NoDatabaseType: 'No database type',
    NoDevDatabaseType: 'No dev database type',
    NoProdDatabaseType: 'No prod database type',
    NoBuildTool: 'No build tool',
    NoApplicationType: 'No application type',
    NoClientFramework: 'No client framework',
    NoChosenLanguage: 'No chosen language when selecting i18n option'
  },
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
