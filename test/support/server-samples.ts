import { MatrixMonolith, MatrixMicroservice, MatrixGateway } from './application-samples.js';
import { fromMatrix, extendMatrix, extendFilteredMatrix, buildSamplesFromMatrix } from './matrix-utils.js';

// eslint-disable-next-line import/prefer-default-export
export const buildServerMatrix = (matrix: Record<string, unknown> = {}) => {
  let serverMatrix = {
    ...fromMatrix({
      ...MatrixMonolith,
      ...matrix,
      reactive: [false, true],
    }),
    ...fromMatrix({
      ...MatrixMicroservice,
      ...matrix,
      reactive: [false, true],
    }),
    ...fromMatrix({
      ...MatrixGateway,
      ...matrix,
    }),
  };

  serverMatrix = extendMatrix(serverMatrix, {
    buildTool: ['maven', 'gradle'],
    enableTranslation: [false, true],
    packageName: ['tech.jhipster', 'com.mycompany'],
    jhiPrefix: ['jhi', 'fix'],
    entitySuffix: ['Entity', ''],
    dtoSuffix: ['DTO', 'Rest'],
    skipCommitHook: [false, true],
    testFrameworks: [[], ['gatling'], ['cucumber']],
    serverSideOptions: [[], ['enableSwaggerCodegen:true']],
  });

  serverMatrix = extendFilteredMatrix(serverMatrix, sample => !sample.reactive, {
    websocket: [false, true],
  });

  serverMatrix = extendFilteredMatrix(serverMatrix, sample => sample.authenticationType !== 'oauth2', {
    skipUserManagement: [false, true],
  });

  serverMatrix = extendFilteredMatrix(serverMatrix, sample => sample.authenticationType === 'session', {
    serviceDiscoveryType: ['no', 'consul'],
  });

  serverMatrix = extendFilteredMatrix(serverMatrix, sample => sample.authenticationType !== 'session', {
    serviceDiscoveryType: ['no', 'consul', 'eureka'],
  });

  return serverMatrix;
};

export const buildServerSamples = (commonConfig?: Record<string, unknown>, matrix?: Record<string, unknown>) => {
  return buildSamplesFromMatrix(buildServerMatrix(matrix), { commonConfig });
};
