import { getFrontendAppName } from '../../base/support/basename.js';
import { CLIENT_MAIN_SRC_DIR, CLIENT_TEST_SRC_DIR } from '../../generator-constants.js';

/**
 * Load client configs into application.
 */
export const loadClientConfig = ({ config, application }: { config: any; application: any }) => {
  application.clientPackageManager = config.clientPackageManager;
  application.clientFramework = config.clientFramework;
  application.clientTheme = config.clientTheme;
  application.clientThemeVariant = config.clientThemeVariant;
  application.devServerPort = config.devServerPort;

  application.clientRootDir = config.clientRootDir ?? '';
  application.clientSrcDir = config.clientSrcDir ?? `${application.clientRootDir}${CLIENT_MAIN_SRC_DIR}`;
  application.clientTestDir = config.clientTestDir ?? `${application.clientRootDir}${CLIENT_TEST_SRC_DIR}`;
};

/**
 * Load client derived properties.
 */
export const loadDerivedClientConfig = ({ application }: { application: any }) => {
  if (application.microfrontend === undefined) {
    if (application.applicationTypeMicroservice) {
      application.microfrontend = application.clientFrameworkAny;
    } else if (application.applicationTypeGateway) {
      application.microfrontend = application.microfrontends && application.microfrontends.length > 0;
    }
  }
  application.clientThemeNone = application.clientTheme === 'none';
  application.clientThemePrimary = application.clientThemeVariant === 'primary';
  application.clientThemeLight = application.clientThemeVariant === 'light';
  application.clientThemeDark = application.clientThemeVariant === 'dark';

  if (application.baseName) {
    application.frontendAppName = getFrontendAppName({ baseName: application.baseName });
  }
};
