import { APPLICATION_TYPE_GATEWAY, APPLICATION_TYPE_MICROSERVICE, APPLICATION_TYPE_MONOLITH } from '../../core/application-types.ts';
import { authenticationTypes } from '../../jhipster/index.js';

const { JWT, OAUTH2, SESSION } = authenticationTypes;
export const AuthenticationTypeMatrix = {
  authenticationType: [OAUTH2, JWT, SESSION],
};

export const MatrixMonolith = {
  applicationType: [APPLICATION_TYPE_MONOLITH],
  ...AuthenticationTypeMatrix,
};

export const MatrixMicroservice = {
  applicationType: [APPLICATION_TYPE_MICROSERVICE],
  authenticationType: [OAUTH2, JWT],
};

export const MatrixGateway = {
  applicationType: [APPLICATION_TYPE_GATEWAY],
  authenticationType: [OAUTH2, JWT],
};

export const MatrixMicroserviceGateway = {
  applicationType: [APPLICATION_TYPE_MICROSERVICE, APPLICATION_TYPE_GATEWAY],
  authenticationType: [OAUTH2, JWT],
};
