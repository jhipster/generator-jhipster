import testSupport from './index.cjs';

import AuthenticationTypes from '../../jdl/jhipster/authentication-types.js';
import ApplicationTypes from '../../jdl/jhipster/application-types.js';

const { basicTests, testBlueprintSupport, testOptions } = testSupport;

export { basicTests, testBlueprintSupport, testOptions };

const { OAUTH2, JWT, SESSION } = AuthenticationTypes;
const { MICROSERVICE, GATEWAY, MONOLITH } = ApplicationTypes;

export const fromMatrix = configMatrix => {
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
          const title = typeof value === 'string' ? value : `${config}(${value})`;
          return [
            `${previousName}${previousName.length === 0 ? '' : '-'}${title}`,
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

export const extendMatrix = (matrix, configMatrix) => {
  const configEntries = Object.entries(configMatrix);
  const additionalMatrixTemp = configEntries.reduce(
    (currentArray, [configName, configValues]) => {
      const currentConfigObjects = configValues.map(configValue => ({ [configName]: configValue }));
      return currentArray
        .map(existingConfig => currentConfigObjects.map(currentObject => ({ ...existingConfig, ...currentObject })))
        .flat();
    },
    [{}]
  );
  const additionalMatrix = [];
  while (additionalMatrixTemp.length > 0) {
    additionalMatrix.push(additionalMatrixTemp.shift());
    if (additionalMatrixTemp.length > 0) {
      additionalMatrix.push(additionalMatrixTemp.pop());
    }
  }
  return Object.fromEntries(
    Object.entries(matrix).map(([matrixName, matrixConfig], matrixIndex) => {
      const newValues = additionalMatrix[matrixIndex % additionalMatrix.length];
      Object.entries(newValues).forEach(([configName, configValue]) => {
        const configTitle = typeof configValue === 'string' ? configName : `${configName}(${configValue})`;
        matrixName = `${matrixName}-${configTitle}`;
      });
      return [matrixName, { ...matrixConfig, ...newValues }];
    })
  );
};

export const AuthenticationTypeMatrix = {
  authenticationType: [OAUTH2, JWT, SESSION],
};

const CONFIG_MATRIX_MONOLITH = {
  applicationType: [MONOLITH],
  ...AuthenticationTypeMatrix,
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
  withAdminUi: [false, true],
  skipJhipsterDependencies: [false, true],
  enableTranslation: [false, true],
};

export const clientSamples = extendMatrix(APPLICATION_MATRIX, CLIENT_ADDITIONAL_CONFIG_MATRIX);
