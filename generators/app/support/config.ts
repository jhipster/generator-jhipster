import { camelCase, kebabCase, startCase, upperFirst } from 'lodash-es';
import { NODE_VERSION } from '../../generator-constants.js';
import { applicationTypes, authenticationTypes, databaseTypes, testFrameworkTypes } from '../../../jdl/index.js';
import { getHipster, mutateData, pickFields, upperFirstCamelCase } from '../../base/support/index.js';
import { getDBTypeFromDBValue } from '../../server/support/index.js';
import detectLanguage from '../../languages/support/detect-language.js';
import { loadConfig, loadDerivedConfig } from '../../../lib/internal/index.js';
import serverCommand from '../../server/command.js';
import { packageJson } from '../../../lib/index.js';

const { GATLING, CUCUMBER, CYPRESS } = testFrameworkTypes;
const { GATEWAY, MONOLITH } = applicationTypes;
const { JWT, OAUTH2, SESSION } = authenticationTypes;
const { NO: NO_DATABASE } = databaseTypes;

/**
 * Load common options to be stored.
 * @deprecated
 */
export function loadStoredAppOptions(this: any, { options = this.options, jhipsterConfig = this.jhipsterConfig, log = this.log } = {}) {
  // Parse options only once.
  if (this.sharedData.getControl().optionsParsed) return;
  this.sharedData.getControl().optionsParsed = true;

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
  if (options.testFrameworks) {
    jhipsterConfig.testFrameworks = [...new Set([...(jhipsterConfig.testFrameworks || []), ...options.testFrameworks])];
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
  loadConfig(serverCommand.configs, { config, application });

  mutateData(
    application,
    {
      nodeVersion: useVersionPlaceholders ? 'NODE_VERSION' : NODE_VERSION,
      jhipsterVersion: useVersionPlaceholders ? 'JHIPSTER_VERSION' : undefined,
    },
    pickFields(config, [
      'jhipsterVersion',
      'baseName',
      'reactive',
      'jhiPrefix',
      'skipFakeData',
      'entitySuffix',
      'dtoSuffix',
      'skipCheckLengthOfIdentifier',
      'microfrontend',
      'microfrontends',
      'skipServer',
      'skipCommitHook',
      'skipClient',
      'prettierJava',
      'pages',
      'skipJhipsterDependencies',
      'withAdminUi',
      'gatewayServerPort',
      'capitalizedBaseName',
      'dasherizedBaseName',
      'humanizedBaseName',
      'projectDescription',
      'authenticationType',
      'rememberMeKey',
      'jwtSecretKey',
      'fakerSeed',
      'skipUserManagement',
      'blueprints',
      'testFrameworks',
      'syncUserWithIdp',
    ]),
    {
      jhipsterVersion: packageJson.version,
      blueprints: [],
      testFrameworks: [],
    },
  );
};

/**
 * @param {Object} dest - destination context to use default is context
 */
export const loadDerivedAppConfig = ({ application }: { application: any }) => {
  loadDerivedConfig(serverCommand.configs, { application });

  mutateData(application, {
    jhiPrefixCapitalized: ({ jhiPrefix }) => upperFirst(jhiPrefix),
    jhiPrefixDashed: ({ jhiPrefix }) => kebabCase(jhiPrefix),

    camelizedBaseName: ({ baseName }) => camelCase(baseName),
    hipster: ({ baseName }) => getHipster(baseName),
    capitalizedBaseName: ({ baseName }) => upperFirst(baseName),
    dasherizedBaseName: ({ baseName }) => kebabCase(baseName),
    lowercaseBaseName: ({ baseName }) => baseName?.toLowerCase(),
    upperFirstCamelCaseBaseName: ({ baseName }) => upperFirstCamelCase(baseName),
    humanizedBaseName: ({ baseName }) => (baseName.toLowerCase() === 'jhipster' ? 'JHipster' : startCase(baseName)),

    gatlingTests: ({ testFrameworks }) => testFrameworks?.includes(GATLING),
    cucumberTests: ({ testFrameworks }) => testFrameworks?.includes(CUCUMBER),
    cypressTests: ({ testFrameworks }) => testFrameworks?.includes(CYPRESS),

    projectDescription: ({ projectDescription, baseName }) => projectDescription ?? `Description for ${baseName}`,
    endpointPrefix: ({ applicationType, lowercaseBaseName }) => (applicationType === 'microservice' ? `services/${lowercaseBaseName}` : ''),
  });

  if (application.microfrontends && application.microfrontends.length > 0) {
    application.microfrontends.forEach(microfrontend => {
      const { baseName } = microfrontend;
      microfrontend.lowercaseBaseName = baseName.toLowerCase();
      microfrontend.capitalizedBaseName = upperFirst(baseName);
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
};
