import { getFrontendAppName } from '../../base/support/basename.js';
import { CLIENT_MAIN_SRC_DIR, CLIENT_TEST_SRC_DIR } from '../../generator-constants.js';

/**
 * Load client configs into application.
 */
export const loadClientConfig = ({ config, application }: { config: any; application: any }) => {
  (application as any).clientPackageManager = config.clientPackageManager;
  application.clientFramework = config.clientFramework;
  (application as any).clientTheme = config.clientTheme;
  (application as any).clientThemeVariant = config.clientThemeVariant;
  (application as any).devServerPort = config.devServerPort;

  (application as any).clientRootDir = config.clientRootDir ?? '';
  (application as any).clientSrcDir = config.clientSrcDir ?? `${application.clientRootDir}${CLIENT_MAIN_SRC_DIR}`;
  (application as any).clientTestDir = config.clientTestDir ?? `${application.clientRootDir}${CLIENT_TEST_SRC_DIR}`;
};

/**
 * Load client derived properties.
 */
export const loadDerivedClientConfig = ({ application }: { application: any }) => {
  if ((application as any).microfrontend === undefined) {
    if ((application as any).applicationTypeMicroservice) {
      (application as any).microfrontend = application.clientFrameworkAny;
    } else if ((application as any).applicationTypeGateway) {
      (application as any).microfrontend = (application as any).microfrontends && (application as any).microfrontends.length > 0;
    }
  }
  (application as any).clientThemeNone = (application as any).clientTheme === 'none';
  (application as any).clientThemePrimary = (application as any).clientThemeVariant === 'primary';
  (application as any).clientThemeLight = (application as any).clientThemeVariant === 'light';
  (application as any).clientThemeDark = (application as any).clientThemeVariant === 'dark';

  if ((application as any).baseName) {
    (application as any).frontendAppName = getFrontendAppName({ baseName: (application as any).baseName });
  }
};
