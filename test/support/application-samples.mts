import AuthenticationTypes from '../../jdl/jhipster/authentication-types.js';
import ApplicationTypes from '../../jdl/jhipster/application-types.js';

const { OAUTH2, JWT, SESSION } = AuthenticationTypes;
const { MICROSERVICE, GATEWAY, MONOLITH } = ApplicationTypes;

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
