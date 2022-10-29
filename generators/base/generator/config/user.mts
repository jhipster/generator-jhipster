import { authenticationTypes } from '../../../../jdl/jhipster/index.mjs';
import { databaseTypes } from '../../../../jdl/jhipster/index.mjs';

const { NO: NO_DATABASE } = databaseTypes;
const { OAUTH2 } = authenticationTypes;

export default function isBuiltInUser(config: any): boolean {
  return (
    !config ||
    (!config.skipUserManagement && config.databaseType !== NO_DATABASE) ||
    (config.authenticationType === OAUTH2 && config.databaseType !== NO_DATABASE)
  );
}
