/* eslint-disable no-console */
import chalk from 'chalk';

const deprecatedProperties = {
  GRADLE_VERSION: {
    replacement: 'gradleVersion',
    get: ({ data }) => data.gradleVersion,
  },
  NODE_VERSION: {
    replacement: 'nodeVersion',
    get: ({ data }) => data.nodeVersion,
  },
  NPM_VERSION: {
    replacement: 'nodeDependencies.npm',
    get: ({ data }) => data.nodeDependencies.npm,
  },
  JHIPSTER_DEPENDENCIES_VERSION: {
    replacement: 'jhipsterDependenciesVersion',
    get: ({ data }) => data.jhipsterDependenciesVersion,
  },
  DOCKER_DIR: {
    replacement: 'dockerServicesDir',
    get: ({ data }) => data.dockerServicesDir,
  },
  CLIENT_MAIN_SRC_DIR: {
    replacement: 'clientSrcDir',
    get: ({ data }) => data.clientSrcDir,
  },
  CLIENT_TEST_SRC_DIR: {
    replacement: 'clientTestDir',
    get: ({ data }) => data.clientTestDir,
  },
  CLIENT_DIST_DIR: {
    replacement: 'clientDistDir',
    get: ({ data }) => data.clientDistDir,
  },
  BUILD_DIR: {
    replacement: 'temporaryDir',
    get: ({ data }) => data.temporaryDir,
  },
  MAIN_SRC_DIR: {
    replacement: 'clientSrcDir',
    get: ({ data }) => data.clientSrcDir,
  },
  DIST_DIR: {
    replacement: 'clientDistDir',
    get: ({ data }) => data.clientDistDir,
  },
  userPrimaryKeyTypeString: {
    replacement: 'user.primaryKey.typeString',
    get: ({ data }) => data.user.primaryKey.typeString,
  },
  userPrimaryKeyTypeUUID: {
    replacement: 'user.primaryKey.typeUUID',
    get: ({ data }) => data.user.primaryKey.typeUUID,
  },
  _getClientTranslation: {
    replacement: 'getWebappTranslation',
    get: ({ data }) => data.getWebappTranslation,
  },
  _getEntityClientTranslation: {
    replacement: 'getWebappTranslation',
    get: ({ data }) => data.getWebappTranslation,
  },
  testsNeedCsrf: {
    replacement: 'authenticationUsesCsrf',
    get: ({ data }) => data.authenticationUsesCsrf,
  },
  haveFieldWithJavadoc: {
    replacement: 'anyFieldHasDocumentation',
    get: ({ data }) => data.anyFieldHasDocumentation,
  },
  fieldsContainBigDecimal: {
    replacement: 'anyFieldIsBigDecimal',
    get: ({ data }) => data.anyFieldIsBigDecimal,
  },
  fieldsContainBlob: {
    replacement: 'anyFieldIsBlobDerived',
    get: ({ data }) => data.anyFieldIsBlobDerived,
  },
  fieldsContainDate: {
    replacement: 'anyFieldIsDateDerived',
    get: ({ data }) => data.anyFieldIsDateDerived,
  },
  fieldsContainDuration: {
    replacement: 'anyFieldIsDuration',
    get: ({ data }) => data.anyFieldIsDuration,
  },
  fieldsContainInstant: {
    replacement: 'anyFieldIsInstant',
    get: ({ data }) => data.anyFieldIsInstant,
  },
  fieldsContainLocalDate: {
    replacement: 'anyFieldIsLocalDate',
    get: ({ data }) => data.anyFieldIsLocalDate,
  },
  fieldsContainTimed: {
    replacement: 'anyFieldIsTimeDerived',
    get: ({ data }) => data.anyFieldIsTimeDerived,
  },
  fieldsContainUUID: {
    replacement: 'anyFieldIsUUID',
    get: ({ data }) => data.anyFieldIsUUID,
  },
  fieldsContainZonedDateTime: {
    replacement: 'anyFieldIsZonedDateTime',
    get: ({ data }) => data.anyFieldIsZonedDateTime,
  },
  fieldsContainImageBlob: {
    replacement: 'anyFieldHasImageContentType',
    get: ({ data }) => data.anyFieldHasImageContentType,
  },
  fieldsContainTextBlob: {
    replacement: 'anyFieldHasTextContentType',
    get: ({ data }) => data.anyFieldHasTextContentType,
  },
  fieldsContainBlobOrImage: {
    replacement: 'anyFieldHasFileBasedContentType',
    get: ({ data }) => data.anyFieldHasFileBasedContentType,
  },
  validation: {
    replacement: 'anyPropertyHasValidation',
    get: ({ data }) => data.anyPropertyHasValidation,
  },
  dependabotPackageJson: {
    replacement: 'nodeDependencies',
    get: ({ data }) => data.nodeDependencies,
  },
  cacheManagerIsAvailable: {
    replacement: 'cacheProviderAny',
    get: ({ data }) => data.cacheProviderAny,
  },
  enableLiquibase: {
    replacement: 'databaseMigrationLiquibase',
    get: ({ data }) => data.databaseMigrationLiquibase,
  },
  databaseTypePostgres: {
    replacement: 'prodDatabaseTypePostgresql',
    get: ({ data }) => data.prodDatabaseTypePostgresql,
  },
  prodDatabaseTypePostgres: {
    replacement: 'prodDatabaseTypePostgresql',
    get: ({ data }) => data.prodDatabaseTypePostgresql,
  },
  databaseTypeMariadb: {
    replacement: 'prodDatabaseTypeMariadb',
    get: ({ data }) => data.prodDatabaseTypeMariadb,
  },
  databaseTypeMysql: {
    replacement: 'prodDatabaseTypeMysql',
    get: ({ data }) => data.prodDatabaseTypeMysql,
  },
  databaseTypeOracle: {
    replacement: 'prodDatabaseTypeOracle',
    get: ({ data }) => data.prodDatabaseTypeOracle,
  },
  databaseTypeMssql: {
    replacement: 'prodDatabaseTypeMssql',
    get: ({ data }) => data.prodDatabaseTypeMssql,
  },
};

const ejsBuiltInProperties = ['__append', '__line', 'escapeFn', 'include', 'undefined'];
const javascriptBuiltInProperties = ['parseInt', 'Boolean', 'JSON', 'Object', 'toString'];

const getProperty = (context, prop) => {
  if (typeof prop === 'symbol') {
    return undefined;
  }
  if (prop in deprecatedProperties) {
    const { replacement, get } = deprecatedProperties[prop];
    const value = get(context);
    console.log(
      `Template data ${chalk.yellow(String(prop))} was removed and should be replaced with ${chalk.yellow(replacement)}. Value: ${value}`,
    );
    return value;
  }
  if (prop?.startsWith?.('DOCKER_')) {
    console.log(
      `Template data ${chalk.yellow(String(prop))} was removed and should be replaced with ${chalk.yellow(
        // eslint-disable-next-line no-template-curly-in-string
        'dockerContainers.${dockerImage}',
      )}.`,
    );
  }
  const { generator, data } = context;
  if (prop in data) {
    return data[prop];
  }
  if (prop in generator) {
    console.log(`Template data ${chalk.yellow(String(prop))} is a generator property.`);
    console.log(`Change the template to '${chalk.yellow(`this.${String(prop)}`)}'`);
    return generator[prop];
  }
  // console.log(`Template data '${chalk.yellow(String(prop))}' not found. Check your data.`);
  // throw new Error(`Template data '${chalk.yellow(String(prop))}' not found. Check your data.`);
  if (prop === 'undefined') {
    throw new Error('Check your data');
  }
  return undefined;
};

const createHandler = ({ ignoreWarnings = false } = {}) => ({
  ...Object.fromEntries(
    [
      'apply',
      'construct',
      'defineProperty',
      'deleteProperty',
      'getOwnPropertyDescriptor',
      'getPrototypeOf',
      'isExtensible',
      'ownKeys',
      'preventExtensions',
      'setPrototypeOf',
      'set',
    ].map(method => [method, (...args) => console.log(`Fixme: template data called ${method}(${args?.pop() ?? ''})`)]),
  ),
  ownKeys: ({ data }) => {
    return Reflect.ownKeys(data);
  },
  getPrototypeOf: ({ data }) => {
    return Object.getPrototypeOf(data);
  },
  getOwnPropertyDescriptor: ({ data }, prop) => {
    return Object.getOwnPropertyDescriptor(data, prop);
  },
  has: (context, prop) => {
    if (ejsBuiltInProperties.includes(prop)) {
      return false;
    }
    if (javascriptBuiltInProperties.includes(prop)) {
      if (!ignoreWarnings) {
        console.log(`${chalk.yellow(prop)} is a javascript built in symbol, its use is discouraged inside templates`);
      }
      return false;
    }
    const propValue = getProperty(context, prop);
    if (propValue === undefined) {
      return prop in context.data;
    }
    return propValue !== undefined;
  },
  get: getProperty,
});

export default function createJHipster7Context(generator, data, options) {
  return new Proxy({ generator, data }, createHandler(options));
}
