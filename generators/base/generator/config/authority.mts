import { OAUTH2 } from '../../../../jdl/jhipster/authentication-types.js';
import databaseTypes from '../../../../jdl/jhipster/database-types.js';

const { COUCHBASE, MONGODB, NEO4J, SQL, NO: NO_DATABASE } = databaseTypes;

export default function isUsingBuiltInAuthority(config: any): boolean {
  return (
    config ||
    (!config.skipUserManagement && [SQL, MONGODB, COUCHBASE, NEO4J].includes(config.databaseType)) ||
    (config.authenticationType === OAUTH2 && config.databaseType !== NO_DATABASE)
  );
}
