import _ from 'lodash';
import { NODE_VERSION } from '../../generator-constants.mjs';
import { applicationTypes, authenticationTypes, databaseTypes, testFrameworkTypes } from '../../../jdl/index.js';
import { getHipster, upperFirstCamelCase } from '../../base/support/index.mjs';
import { getDBTypeFromDBValue } from '../../server/support/index.mjs';
import detectLanguage from '../../languages/support/detect-language.mjs';

const { GATLING, CUCUMBER, CYPRESS } = testFrameworkTypes;
const { GATEWAY, MICROSERVICE, MONOLITH } = applicationTypes;
const { JWT, OAUTH2, SESSION } = authenticationTypes;
const { CASSANDRA, NO: NO_DATABASE } = databaseTypes;

/**
 * Load common options to be stored.
 * @deprecated
 */
export function loadStoredAppOptions(this: any, { options = this.options, jhipsterConfig = this.jhipsterConfig, log = this.log } = {}) {
  // Parse options only once.
  if (this.sharedData.getControl().optionsParsed) return;
  this.sharedData.getControl().optionsParsed = true;

  // Load stored options
  if (options.skipJhipsterDependencies !== undefined) {
    jhipsterConfig.skipJhipsterDependencies = options.skipJhipsterDependencies;
  }
  if (options.incrementalChangelog !== undefined) {
    jhipsterConfig.incrementalChangelog = options.incrementalChangelog;
  }
  if (options.withAdminUi !== undefined) {
    jhipsterConfig.withAdminUi = options.withAdminUi;
  }
  if (options.skipClient) {
    jhipsterConfig.skipClient = true;
  }
  if (options.applicationType) {
    jhipsterConfig.applicationType = options.applicationType;
  }
  if (options.skipServer) {
    jhipsterConfig.skipServer = true;
  }
  if (options.skipFakeData) {
    jhipsterConfig.skipFakeData = true;
  }
  if (options.skipUserManagement) {
    jhipsterConfig.skipUserManagement = true;
  }
  if (options.skipCheckLengthOfIdentifier) {
    jhipsterConfig.skipCheckLengthOfIdentifier = true;
  }

  if (options.skipCommitHook) {
    jhipsterConfig.skipCommitHook = true;
  }

  if (options.baseName) {
    jhipsterConfig.baseName = options.baseName;
  }
  if (options.db) {
    const databaseType = getDBTypeFromDBValue(options.db);
    if (databaseType) {
      jhipsterConfig.databaseType = databaseType;
    } else if (!jhipsterConfig.databaseType) {
      throw new Error(`Could not detect databaseType for database ${options.db}`);
    }
    jhipsterConfig.devDatabaseType = options.db;
    jhipsterConfig.prodDatabaseType = options.db;
  }
  if (options.auth) {
    jhipsterConfig.authenticationType = options.auth;
  }
  if (options.searchEngine) {
    jhipsterConfig.searchEngine = options.searchEngine;
  }
  if (options.build) {
    jhipsterConfig.buildTool = options.build;
  }
  if (options.websocket) {
    jhipsterConfig.websocket = options.websocket;
  }
  if (options.jhiPrefix !== undefined) {
    jhipsterConfig.jhiPrefix = options.jhiPrefix;
  }
  if (options.entitySuffix !== undefined) {
    jhipsterConfig.entitySuffix = options.entitySuffix;
  }
  if (options.dtoSuffix !== undefined) {
    jhipsterConfig.dtoSuffix = options.dtoSuffix;
  }
  if (options.clientFramework) {
    jhipsterConfig.clientFramework = options.clientFramework;
  }
  if (options.testFrameworks) {
    jhipsterConfig.testFrameworks = [...new Set([...(jhipsterConfig.testFrameworks || []), ...options.testFrameworks])];
  }
  if (options.cypressCoverage !== undefined) {
    jhipsterConfig.cypressCoverage = options.cypressCoverage;
  }
  if (options.cypressAudit !== undefined) {
    jhipsterConfig.cypressAudit = options.cypressAudit;
  }
  if (options.enableTranslation !== undefined) {
    jhipsterConfig.enableTranslation = options.enableTranslation;
  }
  if (options.language) {
    // workaround double options parsing, remove once generator supports skipping parse options
    const languages = options.language.flat();
    if (languages.length === 1 && languages[0] === 'false') {
      jhipsterConfig.enableTranslation = false;
    } else {
      jhipsterConfig.languages = [...(jhipsterConfig.languages || []), ...languages];
    }
  }
  if (options.nativeLanguage) {
    if (typeof options.nativeLanguage === 'string') {
      jhipsterConfig.nativeLanguage = options.nativeLanguage;
      if (!jhipsterConfig.languages) {
        jhipsterConfig.languages = [options.nativeLanguage];
      }
    } else if (options.nativeLanguage === true) {
      jhipsterConfig.nativeLanguage = detectLanguage();
    }
  }

  if (options.pkType) {
    jhipsterConfig.pkType = options.pkType;
  }

  if (options.cacheProvider !== undefined) {
    jhipsterConfig.cacheProvider = options.cacheProvider;
  }

  if (options.enableHibernateCache !== undefined) {
    jhipsterConfig.enableHibernateCache = options.enableHibernateCache;
  }

  if (options.microfrontend) {
    jhipsterConfig.microfrontend = options.microfrontend;
  }

  if (options.reactive !== undefined) {
    jhipsterConfig.reactive = options.reactive;
  }

  if (options.enableSwaggerCodegen !== undefined) {
    jhipsterConfig.enableSwaggerCodegen = options.enableSwaggerCodegen;
  }

  if (options.clientPackageManager) {
    jhipsterConfig.clientPackageManager = options.clientPackageManager;
  }
  if (jhipsterConfig.clientPackageManager) {
    const usingNpm = jhipsterConfig.clientPackageManager === 'npm';
    if (!usingNpm) {
      log?.warn(`Using unsupported package manager: ${jhipsterConfig.clientPackageManager}. Install will not be executed.`);
      options.skipInstall = true;
    }
  }
}

/**
 * Load app configs into application.
 * all variables should be set to dest,
 * all variables should be referred from config,
 * @param {any} config - config to load config from
 * @param {any} dest - destination context to use default is context
 */
export const loadAppConfig = ({
  config,
  application,
  useVersionPlaceholders,
}: {
  config: any;
  application: any;
  useVersionPlaceholders?: boolean;
}) => {
  if (useVersionPlaceholders) {
    application.nodeVersion = 'NODE_VERSION';
  } else {
    application.nodeVersion = NODE_VERSION;
  }

  application.jhipsterVersion = config.jhipsterVersion;
  application.baseName = config.baseName;
  application.applicationType = config.applicationType;
  application.reactive = config.reactive;
  application.jhiPrefix = config.jhiPrefix;
  application.skipFakeData = config.skipFakeData;
  application.entitySuffix = config.entitySuffix;
  application.dtoSuffix = config.dtoSuffix;
  application.skipCheckLengthOfIdentifier = config.skipCheckLengthOfIdentifier;
  application.microfrontend = config.microfrontend;
  application.microfrontends = config.microfrontends;

  application.skipServer = config.skipServer;
  application.skipCommitHook = config.skipCommitHook;
  application.blueprints = config.blueprints || [];
  application.skipClient = config.skipClient;
  application.prettierJava = config.prettierJava;
  application.pages = config.pages;
  application.skipJhipsterDependencies = !!config.skipJhipsterDependencies;
  application.withAdminUi = config.withAdminUi;
  application.gatewayServerPort = config.gatewayServerPort;

  application.capitalizedBaseName = config.capitalizedBaseName;
  application.dasherizedBaseName = config.dasherizedBaseName;
  application.humanizedBaseName = config.humanizedBaseName;
  application.projectDescription = config.projectDescription;

  application.testFrameworks = config.testFrameworks || [];

  application.gatlingTests = application.testFrameworks.includes(GATLING);
  application.cucumberTests = application.testFrameworks.includes(CUCUMBER);
  application.cypressTests = application.testFrameworks.includes(CYPRESS);

  application.authenticationType = config.authenticationType;
  application.rememberMeKey = config.rememberMeKey;
  application.jwtSecretKey = config.jwtSecretKey;
  application.fakerSeed = config.fakerSeed;
  application.skipUserManagement = config.skipUserManagement;
};

/**
 * @param {Object} dest - destination context to use default is context
 */
export const loadDerivedAppConfig = ({ application }: { application: any }) => {
  application.jhiPrefixCapitalized = _.upperFirst(application.jhiPrefix);
  application.jhiPrefixDashed = _.kebabCase(application.jhiPrefix);
  application.applicationTypeGateway = application.applicationType === GATEWAY;
  application.applicationTypeMonolith = application.applicationType === MONOLITH;
  application.applicationTypeMicroservice = application.applicationType === MICROSERVICE;

  // Application name modified, using each technology's conventions
  if (application.baseName) {
    application.camelizedBaseName = _.camelCase(application.baseName);
    application.hipster = getHipster(application.baseName);
    application.capitalizedBaseName = application.capitalizedBaseName || _.upperFirst(application.baseName);
    application.dasherizedBaseName = application.dasherizedBaseName || _.kebabCase(application.baseName);
    application.lowercaseBaseName = application.baseName.toLowerCase();
    application.upperFirstCamelCaseBaseName = upperFirstCamelCase(application.baseName);
    application.humanizedBaseName =
      application.humanizedBaseName || (application.baseName.toLowerCase() === 'jhipster' ? 'JHipster' : _.startCase(application.baseName));
    application.projectDescription = application.projectDescription || `Description for ${application.baseName}`;
    application.endpointPrefix = application.applicationTypeMicroservice ? `services/${application.lowercaseBaseName}` : '';
  }

  if (application.microfrontends && application.microfrontends.length > 0) {
    application.microfrontends.forEach(microfrontend => {
      const { baseName } = microfrontend;
      microfrontend.lowercaseBaseName = baseName.toLowerCase();
      microfrontend.capitalizedBaseName = _.upperFirst(baseName);
      microfrontend.endpointPrefix = `services/${microfrontend.lowercaseBaseName}`;
    });
  } else if (application.microfrontend) {
    application.microfrontends = [];
  }
  application.microfrontend =
    application.microfrontend ||
    (application.applicationTypeMicroservice && !application.skipClient) ||
    (application.applicationTypeGateway && application.microfrontends && application.microfrontends.length > 0);

  if (application.microfrontend && application.applicationTypeMicroservice && !application.gatewayServerPort) {
    application.gatewayServerPort = 8080;
  }

  application.authenticationTypeSession = application.authenticationType === SESSION;
  application.authenticationTypeJwt = application.authenticationType === JWT;
  application.authenticationTypeOauth2 = application.authenticationType === OAUTH2;

  application.generateAuthenticationApi = application.applicationType === MONOLITH || application.applicationType === GATEWAY;
  const authenticationApiWithUserManagement = application.authenticationType !== OAUTH2 && application.generateAuthenticationApi;
  application.generateUserManagement =
    !application.skipUserManagement && application.databaseType !== NO_DATABASE && authenticationApiWithUserManagement;
  application.generateInMemoryUserCredentials = !application.generateUserManagement && authenticationApiWithUserManagement;

  // TODO make UserEntity optional on relationships for microservices and oauth2
  // TODO check if we support syncWithIdp using jwt authentication
  // Used for relationships and syncWithIdp
  const usesSyncWithIdp = application.authenticationType === OAUTH2 && application.databaseType !== NO_DATABASE;
  application.generateBuiltInUserEntity = application.generateUserManagement || usesSyncWithIdp;

  application.generateBuiltInAuthorityEntity = application.generateBuiltInUserEntity && application.databaseType !== CASSANDRA;
};
