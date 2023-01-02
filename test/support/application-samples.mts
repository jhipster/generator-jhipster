import { applicationTypes, authenticationTypes } from '../../jdl/jhipster/index.mjs';

const { JWT, OAUTH2, SESSION } = authenticationTypes;
const { GATEWAY, MICROSERVICE, MONOLITH } = applicationTypes;
export const AuthenticationTypeMatrix = {
  authenticationType: [OAUTH2, JWT, SESSION],
};

export const MatrixMonolith = {
  applicationType: [MONOLITH],
  ...AuthenticationTypeMatrix,
};

export const MatrixMicroservice = {
  applicationType: [MICROSERVICE],
  authenticationType: [OAUTH2, JWT],
};

export const MatrixGateway = {
  applicationType: [GATEWAY],
  authenticationType: [OAUTH2, JWT],
};

export const MatrixMicroserviceGateway = {
  applicationType: [MICROSERVICE, GATEWAY],
  authenticationType: [OAUTH2, JWT],
};
