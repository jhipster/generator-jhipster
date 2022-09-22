import testSupport from './index.cjs';

import AuthenticationTypes from '../../jdl/jhipster/authentication-types.js';
import ApplicationTypes from '../../jdl/jhipster/application-types.js';

const { basicTests, testBlueprintSupport, testOptions } = testSupport;

export { basicTests, testBlueprintSupport, testOptions };

const { OAUTH2, JWT, SESSION } = AuthenticationTypes;
const { MICROSERVICE, GATEWAY, MONOLITH } = ApplicationTypes;

const fromMatrix = configMatrix => {
  const configEntries = Object.entries(configMatrix);
  const samples = configEntries.reduce((previousValue, currentValue) => {
    const [config, configValues] = currentValue;
    if (previousValue.length === 0) {
      return configValues.map(value => [
        value,
        {
          [config]: value,
        },
      ]);
    }
    return previousValue
      .map(([previousName, previousConfig]) =>
        configValues.map(value => {
          return [
            `${previousName}${previousName.length === 0 ? '' : '-'}${value}`,
            {
              ...previousConfig,
              [config]: value,
            },
          ];
        })
      )
      .flat();
  }, []);
  return Object.fromEntries(samples);
};

const injectValues = (matrix, configMatrix) => {
  const configEntries = Object.entries(configMatrix);
  return Object.fromEntries(
    Object.entries(matrix).map(([matrixName, matrixConfig], idx) => {
      for (const [configName, configValues] of configEntries) {
        const configValue = configValues[idx % configValues.length];
        const configTitle = typeof configValue === 'boolean' ? `${configName}(${configValue})` : configName;
        matrixName = `${matrixName}-${configTitle}`;
        matrixConfig[configName] = configValue;
      }
      return [matrixName, matrixConfig];
    })
  );
};

const CONFIG_MATRIX_MONOLITH = {
  applicationType: [MONOLITH],
  authenticationType: [OAUTH2, JWT, SESSION],
};

const CONFIG_MATRIX_MICROSERVICE_GATEWAY = {
  applicationType: [MICROSERVICE, GATEWAY],
  authenticationType: [OAUTH2, JWT],
};

const APPLICATION_MATRIX = {
  ...fromMatrix(CONFIG_MATRIX_MONOLITH),
  ...fromMatrix(CONFIG_MATRIX_MICROSERVICE_GATEWAY),
};

const CLIENT_ADDITIONAL_CONFIG_MATRIX = {
  withAdminUi: [true, false],
  skipJhipsterDependencies: [true, false],
};

export const clientSamples = injectValues(APPLICATION_MATRIX, CLIENT_ADDITIONAL_CONFIG_MATRIX);
