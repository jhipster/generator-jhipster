import { MatrixMonolith, MatrixMicroserviceGateway } from './application-samples.mjs';
import { extendFilteredMatrix, extendMatrix, fromMatrix } from './matrix-utils.mjs';

const CLIENT_ADDITIONAL_CONFIG_MATRIX = {
  withAdminUi: [false, true],
  skipJhipsterDependencies: [false, true],
  enableTranslation: [false, true],
  clientSrcDir: [
    undefined,
    { value: 'src/', additional: { clientTestDir: 'test/' } },
    { value: 'src/main/webapp2/', additional: { clientTestDir: 'src/test/javascript2/' } },
  ],
  websocket: [false, true],
};

export const buildClientSamples = () => {
  let clientMatrix = {
    ...fromMatrix(MatrixMonolith),
    ...fromMatrix(MatrixMicroserviceGateway),
  };

  clientMatrix = extendFilteredMatrix(clientMatrix, sample => sample.authenticationType !== 'oauth2', {
    skipUserManagement: [false, true],
  });

  clientMatrix = extendMatrix(clientMatrix, CLIENT_ADDITIONAL_CONFIG_MATRIX);

  return clientMatrix;
};

// eslint-disable-next-line import/prefer-default-export
export const clientSamples = buildClientSamples();
