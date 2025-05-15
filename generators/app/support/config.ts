import { camelCase, kebabCase, startCase, upperFirst } from 'lodash-es';
import { NODE_VERSION } from '../../generator-constants.js';
import { applicationTypes, authenticationTypes, databaseTypes, testFrameworkTypes } from '../../../lib/jhipster/index.js';
import { getHipster, mutateData, pickFields, upperFirstCamelCase } from '../../base/support/index.js';
import { loadConfig, loadDerivedConfig } from '../../../lib/internal/index.js';
import serverCommand from '../../server/command.js';
import { packageJson } from '../../../lib/index.js';
import type { ApplicationType } from '../../../lib/types/application/application.js';

const { GATLING, CUCUMBER, CYPRESS } = testFrameworkTypes;
const { GATEWAY, MONOLITH } = applicationTypes;
const { JWT, OAUTH2, SESSION } = authenticationTypes;
const { NO: NO_DATABASE } = databaseTypes;

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
  application: ApplicationType;
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
  } as any);

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
