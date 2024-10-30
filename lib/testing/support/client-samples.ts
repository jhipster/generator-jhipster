import { MatrixMicroserviceGateway, MatrixMonolith } from './application-samples.js';
import { buildSamplesFromMatrix, extendFilteredMatrix, extendMatrix, fromMatrix } from './matrix-utils.js';

const CLIENT_ADDITIONAL_CONFIG_MATRIX = {
  withAdminUi: [false, true],
  skipJhipsterDependencies: [false, true],
  enableTranslation: [false, true],
  clientRootDir: [undefined, { value: 'clientRoot/' }, { value: '' }],
  websocket: [false, true],
};

export const buildClientSamples = (commonConfig?: Record<string, unknown>): Record<string, Record<string, unknown>> => {
  let clientMatrix = {
    ...fromMatrix(MatrixMonolith),
    ...fromMatrix(MatrixMicroserviceGateway),
  };

  clientMatrix = extendFilteredMatrix(clientMatrix, sample => sample.authenticationType !== 'oauth2', {
    skipUserManagement: [false, true],
  });

  clientMatrix = extendMatrix(clientMatrix, CLIENT_ADDITIONAL_CONFIG_MATRIX);

  return buildSamplesFromMatrix(clientMatrix, { commonConfig });
};

export const clientSamples = buildClientSamples();
