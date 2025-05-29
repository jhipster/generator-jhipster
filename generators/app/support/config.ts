import { upperFirst } from 'lodash-es';
import { applicationTypes, authenticationTypes, databaseTypes } from '../../../lib/jhipster/index.js';
import { mutateData } from '../../../lib/utils/index.js';
import { loadDerivedConfig } from '../../../lib/internal/index.js';
import serverCommand from '../../server/command.js';

const { GATEWAY, MONOLITH } = applicationTypes;
const { JWT, OAUTH2, SESSION } = authenticationTypes;
const { NO: NO_DATABASE } = databaseTypes;

/**
 * @param {Object} dest - destination context to use default is context
 */
export const loadDerivedAppConfig = ({ application }: { application: any }) => {
  loadDerivedConfig(serverCommand.configs, { application });

  mutateData(application, {
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
