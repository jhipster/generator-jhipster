import type { ConfigAll } from '../../types/command-all.ts';

import { MatrixMicroserviceGateway, MatrixMonolith } from './application-samples.ts';
import { type Matrix, buildSamplesFromMatrix, extendFilteredMatrix, extendMatrix, fromMatrix } from './matrix-utils.ts';

const CLIENT_ADDITIONAL_CONFIG_MATRIX = {
  withAdminUi: [false, true],
  skipJhipsterDependencies: [false, true],
  enableTranslation: [false, true],
  clientRootDir: [undefined, { value: 'clientRoot/' }, { value: '' }],
  websocket: [false, true],
};

export const buildClientSamples = (commonConfig?: ConfigAll): Matrix => {
  let clientMatrix = {
    ...fromMatrix<ConfigAll>(MatrixMonolith),
    ...fromMatrix<ConfigAll>(MatrixMicroserviceGateway),
  };

  clientMatrix = extendFilteredMatrix(clientMatrix, sample => sample.authenticationType !== 'oauth2', {
    skipUserManagement: [false, true],
  });

  clientMatrix = extendMatrix(clientMatrix, CLIENT_ADDITIONAL_CONFIG_MATRIX);

  return buildSamplesFromMatrix(clientMatrix, { commonConfig });
};

export const clientSamples = buildClientSamples();
