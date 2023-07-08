/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

/**
 * Returns the JDBC URL for a databaseType
 *
 * @param databaseType
 * @param options
 * @returns
 */
export function getJdbcUrl(databaseType: string, options?: DatabaseUrlOptions) {
  return getDatabaseUrl(databaseType, 'jdbc', options);
}

/**
 * Returns the R2DBC URL for a databaseType
 *
 * @param databaseType
 * @param options
 * @returns
 */
export function getR2dbcUrl(databaseType: string, options?: DatabaseUrlOptions) {
  return getDatabaseUrl(databaseType, 'r2dbc', options);
}
