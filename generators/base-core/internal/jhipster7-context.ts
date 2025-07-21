/* eslint-disable no-console */
import chalk from 'chalk';
import { camelCase } from 'lodash-es';

import { isReservedTableName } from '../../../lib/jhipster/reserved-keywords.js';
import {
  getJavaValueGeneratorForType,
  getJoinTableName,
  getPrimaryKeyValue,
  getSpecificationBuildForType,
  hibernateSnakeCase,
} from '../../server/support/index.js';
import { getDBCExtraOption } from '../../spring-data-relational/support/database-data.js';
import { getJdbcUrl, getR2dbcUrl } from '../../spring-data-relational/support/database-url.js';
import { fieldTypes } from '../../../lib/jhipster/index.js';
import { upperFirstCamelCase } from '../../../lib/utils/index.js';
import type { ApplicationAll } from '../../../lib/types/application-properties-all.js';
import type CoreGenerator from '../generator.ts';

const { BYTES, BYTE_BUFFER } = fieldTypes.RelationalOnlyDBTypes;

type Handler = { log: (msg: string) => void };
type HandledContext = { generator: CoreGenerator; data: ApplicationAll };

type MigrationProperty = Record<
  string,
  {
    behaviorOnlyReason?: string;
    replacement?: string;
    get: (args: HandledContext) => any;
  }
>;

export const jhipster7deprecatedProperties: MigrationProperty = {
  devDatabaseType: {
    behaviorOnlyReason: 'v8: devDatabaseType is only used in jhipster:spring-data-relational generator',
    get: ({ data }) => {
      if (data.devDatabaseType !== undefined) return data.devDatabaseType;
      const fallbackValue = data.prodDatabaseType ?? data.databaseType;

      console.log(
        `JHipster v8 behavior change(devDatabaseType is only used in jhipster:spring-data-relational generator): devDatabaseType is not set, using fallback: ${fallbackValue}`,
      );
      return fallbackValue;
    },
  },
  prodDatabaseType: {
    behaviorOnlyReason: 'v8: prodDatabaseType is only used in jhipster:spring-data-relational generator',
    get: ({ data }) => {
      if (data.prodDatabaseType !== undefined) return data.prodDatabaseType;

      console.log(
        `JHipster v8 behavior change(prodDatabaseType is only used in jhipster:spring-data-relational generator): devDatabaseType is not set, using fallback: ${data.databaseType}`,
      );
      return data.databaseType;
    },
  },
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
  JAVA_VERSION: {
    replacement: 'javaVersion',
    get: ({ data }) => data.javaVersion,
  },
  JAVA_COMPATIBLE_VERSIONS: {
    replacement: 'javaCompatibleVersions',
    get: ({ data }) => data.javaCompatibleVersions,
  },
  SPRING_BOOT_VERSION: {
    replacement: "javaDependencies['spring-boot']",
    get: ({ data }) => data.javaDependencies['spring-boot'],
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
    get: ({ data }) => data.user?.primaryKey?.typeString,
  },
  userPrimaryKeyTypeUUID: {
    replacement: 'user.primaryKey.typeUUID',
    get: ({ data }) => data.user?.primaryKey?.typeUUID,
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
    get: ({ data }) => ({ dependencies: data.nodeDependencies, devDependencies: data.nodeDependencies }),
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
  cacheProviderEhCache: {
    replacement: 'cacheProviderEhcache',
    get: ({ data }) => data.cacheProviderEhcache,
  },

  getJDBCUrl: {
    replacement: '(prod/dev)(Jdbc/Liquibase)Url or this.getJDBCUrl',
    get: () => getJdbcUrl,
  },
  getR2DBCUrl: {
    replacement: '(prod/dev)R2dbcUrl of this.getR2DBCUrl',
    get: () => getR2dbcUrl,
  },
  getDBCExtraOption: {
    replacement: '???',
    get: () => getDBCExtraOption,
  },
  getPrimaryKeyValue: {
    replacement: 'current generator primaryKey.javaSampleValues[0|1|2]',
    get: () => getPrimaryKeyValue,
  },
  getJoinTableName: {
    replacement: 'joinTable property',
    get:
      () =>
      (...args: Parameters<typeof getJoinTableName>) =>
        getJoinTableName(...args).value,
  },
  getJavaValueGeneratorForType: {
    replacement: 'javaValueGenerator property',
    get: () => (type: string) => getJavaValueGeneratorForType(type).replace('longCount', 'count'),
  },
  asEntity: {
    replacement: 'persistClass property',
    get:
      ({ data }) =>
      (name: any) =>
        `${name}${data.entitySuffix}`,
  },
  asDto: {
    replacement: 'restClass property',
    get:
      ({ data }) =>
      (name: any) =>
        `${name}${data.dtoSuffix}`,
  },
  upperFirstCamelCase: {
    replacement: 'upperFirstCamelCase* property alternative',
    get: () => upperFirstCamelCase,
  },
  hasOauthUser: {
    replacement: 'authenticationTypeOauth2 && generateBuiltInUserEntity',
    get: ({ data }) => data.authenticationTypeOauth2 && data.generateBuiltInUserEntity,
  },
  getPrettierExtensions: {
    replacement: 'prettierExtensions',
    get:
      ({ data }) =>
      () =>
        data.prettierExtensions,
  },
  _generateSqlSafeName: {
    replacement: 'relationshipSqlSafeName property',
    get: () => (name: any) => (isReservedTableName(name, 'sql') ? `e_${name}` : name),
  },
  isFilterableType: {
    replacement: 'filterableField property',
    get: () => (fieldType: string) => ![BYTES, BYTE_BUFFER].includes(fieldType as any),
  },
  getSpecificationBuilder: {
    replacement: 'field.fieldJavaBuildSpecification || primaryKey.javaBuildSpecification',
    get: () => getSpecificationBuildForType,
  },
  getColumnName: {
    replacement: 'entityTableName || relationship.columnName property',
    get: () => hibernateSnakeCase,
  },
  isUsingBuiltInUser: {
    replacement: 'generateBuiltInUserEntity',
    get:
      ({ data }) =>
      () =>
        data.generateBuiltInUserEntity,
  },
  isUsingBuiltInAuthority: {
    replacement: 'generateBuiltInAuthorityEntity',
    get:
      ({ data }) =>
      () =>
        data.generateBuiltInAuthorityEntity,
  },
  jhipsterConfig: {
    replacement: 'none',
    get: ({ generator }) => generator.config?.getAll?.(),
  },
  configOptions: {
    replacement: 'none',
    get: () => ({}),
  },
  // JHipster v8
  devDatabaseTypePostgres: {
    replacement: 'prodDatabaseTypePostgresql',
    get: ({ data }) => data.prodDatabaseTypePostgresql,
  },
  entityInstanceDbSafe: {
    replacement: 'entityJpqlInstance property',
    get: ({ data }) => data.entityJpqlInstance,
  },
};

const ejsBuiltInProperties: (string | symbol)[] = ['__append', '__line', 'escapeFn', 'include', 'undefined'];
const javascriptBuiltInProperties: (string | symbol)[] = ['parseInt', 'Boolean', 'JSON', 'Object', 'toString'];

const getPropertBuilder =
  ({ log = (msg: any) => console.log(msg) } = {}) =>
  (context: HandledContext, prop: string | symbol) => {
    if (typeof prop === 'symbol') {
      return undefined;
    }

    const { generator, data } = context;
    const value = prop in data ? data[prop] : undefined;
    if (prop in jhipster7deprecatedProperties) {
      const { replacement, get, behaviorOnlyReason } = jhipster7deprecatedProperties[prop];
      const fallBackValue = get(context);
      const valueDesc = prop in data ? `Value: ${value}, ` : '';
      if (!behaviorOnlyReason) {
        log(
          `Template data ${chalk.yellow(String(prop))} was removed and should be replaced with ${chalk.yellow(replacement)}. ${valueDesc}FallbackValue: ${fallBackValue}`,
        );
      }
      return value ?? fallBackValue;
    }
    if (prop?.startsWith?.('DOCKER_')) {
      const container = camelCase(prop.replace('DOCKER_', '').replace('_CONTAINER', ''));
      log(
        `Template data ${chalk.yellow(String(prop))} was removed and should be replaced with ${chalk.yellow(
          `dockerContainers.${container}`,
        )}.`,
      );
      return value ?? data.dockerContainers?.[container];
    }
    if (prop in data) {
      return value;
    }
    if (prop in generator) {
      log(`Template data ${chalk.yellow(String(prop))} is a generator property.`);
      log(`Change the template to '${chalk.yellow(`this.${String(prop)}`)}'`);
      return generator[prop as keyof typeof generator];
    }
    // console.log(`Template data '${chalk.yellow(String(prop))}' not found. Check your data.`);
    // throw new Error(`Template data '${chalk.yellow(String(prop))}' not found. Check your data.`);
    if (prop === 'undefined') {
      throw new Error('Check your data');
    }
    return undefined;
  };

const createHandler = ({ log }: Handler = { log: msg => console.log(msg) }): ProxyHandler<HandledContext> => {
  const getProperty = getPropertBuilder({ log });
  return {
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
      ].map(method => [method, (...args: any[]) => console.log(`Fixme: template data called ${method}(${args?.pop() ?? ''})`)]),
    ),
    ownKeys: ({ data }) => Reflect.ownKeys(data),
    getPrototypeOf: ({ data }) => Object.getPrototypeOf(data),
    getOwnPropertyDescriptor: ({ data }, prop) => Object.getOwnPropertyDescriptor(data, prop),
    has: (context, prop) => {
      if (ejsBuiltInProperties.includes(prop)) {
        return false;
      }
      if (javascriptBuiltInProperties.includes(prop)) {
        log(`${chalk.yellow(prop)} is a javascript built in symbol, its use is discouraged inside templates`);
        return false;
      }
      const propValue = getProperty(context, prop);
      if (propValue === undefined && context.data !== undefined) {
        return prop in context.data;
      }
      return true;
    },
    get: getProperty,
  } satisfies ProxyHandler<HandledContext>;
};

export function createJHipster7Context(generator: CoreGenerator, data: ApplicationAll, options: { log: (msg: string) => void }) {
  return new Proxy({ generator, data }, createHandler(options));
}
