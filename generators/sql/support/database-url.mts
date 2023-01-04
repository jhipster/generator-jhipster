import { databaseTypes } from '../../../jdl/jhipster/index.mjs';
import databaseData, { type getData } from './database-data.mjs';

const { ORACLE, MYSQL, POSTGRESQL, MARIADB, MSSQL, H2_DISK, H2_MEMORY } = databaseTypes;

type DatabaseUrlOptions = Parameters<getData>[0] & { databaseName?: string; hostname?: string; skipExtraOptions?: boolean };

export default function getDatabaseUrl(databaseType: string, protocol: string, options: DatabaseUrlOptions = {}): string {
  if (!protocol) {
    throw new Error('protocol is required');
  }
  const { databaseName, hostname, skipExtraOptions } = options;
  if (!databaseName) {
    throw new Error("option 'databaseName' is required");
  }
  if ([MYSQL, MARIADB, POSTGRESQL, ORACLE, MSSQL].includes(databaseType) && !hostname) {
    throw new Error(`option 'hostname' is required for ${databaseType} databaseType`);
  } else if (![MYSQL, MARIADB, POSTGRESQL, ORACLE, MSSQL, H2_DISK, H2_MEMORY].includes(databaseType)) {
    throw new Error(`${databaseType} databaseType is not supported`);
  }
  let databaseDataForType = databaseData[databaseType];
  if (databaseDataForType[protocol]) {
    databaseDataForType = {
      ...databaseDataForType,
      ...databaseDataForType[protocol],
    };
  }
  if (databaseDataForType.getData) {
    databaseDataForType = {
      ...databaseDataForType,
      ...(databaseDataForType.getData(options) || {}),
    };
  }
  const { port = '', protocolSuffix = '', extraOptions = '', localDirectory = options.localDirectory } = databaseDataForType;
  let url = `${protocol}:${protocolSuffix}`;
  if (hostname || localDirectory) {
    url = `${url}${localDirectory || hostname + port}${databaseName}`;
  } else {
    url = `${url}${databaseName}${port}`;
  }
  return `${url}${skipExtraOptions ? '' : extraOptions}`;
}
