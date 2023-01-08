/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import { databaseTypes, fieldTypes } from '../../../jdl/jhipster/index.mjs';

const dbTypes = fieldTypes;
const { STRING: TYPE_STRING, LONG: TYPE_LONG, UUID: TYPE_UUID } = dbTypes.CommonDBTypes;
const { MONGODB, NEO4J, COUCHBASE, CASSANDRA } = databaseTypes;
/**
 * @private
 * Return the primary key data type based on DB
 *
 * @param {any} databaseType - the database type
 */
// eslint-disable-next-line import/prefer-default-export
export const getPkType = (jhipsterConfig, databaseType) => {
  if (jhipsterConfig.pkType) {
    return jhipsterConfig.pkType;
  }
  if ([MONGODB, NEO4J, COUCHBASE].includes(databaseType)) {
    return TYPE_STRING;
  }
  if (databaseType === CASSANDRA) {
    return TYPE_UUID;
  }
  return TYPE_LONG;
};
