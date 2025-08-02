import { upperFirst } from 'lodash-es';
import { authenticationTypes, databaseTypes } from '../../../lib/jhipster/index.ts';
import { loadDerivedConfig } from '../../base-core/internal/index.ts';
import serverCommand from '../../server/command.ts';
import type { Application as CommonApplication } from '../../common/types.d.ts';
import { APPLICATION_TYPE_GATEWAY, APPLICATION_TYPE_MONOLITH } from '../../../lib/core/application-types.ts';

const { JWT, OAUTH2, SESSION } = authenticationTypes;
const { NO: NO_DATABASE } = databaseTypes;

/**
 * @param {Object} dest - destination context to use default is context
 */
export const loadDerivedAppConfig = ({ application }: { application: CommonApplication }) => {
  loadDerivedConfig(serverCommand.configs, { application });

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

  application.generateAuthenticationApi =
    application.applicationType === APPLICATION_TYPE_MONOLITH || application.applicationType === APPLICATION_TYPE_GATEWAY;
  const authenticationApiWithUserManagement = application.authenticationType !== OAUTH2 && application.generateAuthenticationApi;
  application.generateUserManagement =
    !application.skipUserManagement && application.databaseType !== NO_DATABASE && authenticationApiWithUserManagement;
  application.generateInMemoryUserCredentials = !application.generateUserManagement && authenticationApiWithUserManagement;
};
