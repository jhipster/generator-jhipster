/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import { databaseTypes, fieldTypes } from '../../../../../lib/jhipster/index.ts';

const { STRING: TYPE_STRING, LONG: TYPE_LONG, UUID: TYPE_UUID } = fieldTypes.CommonDBTypes;
const { MONGODB, NEO4J, COUCHBASE, CASSANDRA, SQL } = databaseTypes;

/** What a generator writing a backend needs to know of a database, whichever technology it writes. */
export type DatabaseTypeData = {
  name: string;
  defaultPrimaryKeyType: string;
  /** The port the database listens to by default, when it is not a relational one, whose port depends on its vendor. */
  defaultPort?: number;
};

const databaseTypeDataFallback: DatabaseTypeData = {
  name: 'Unknown',
  defaultPrimaryKeyType: TYPE_LONG,
};

export const databaseTypeData: Record<string, DatabaseTypeData> = {
  [CASSANDRA]: {
    name: 'Cassandra',
    defaultPrimaryKeyType: TYPE_UUID,
    defaultPort: 9042,
  },
  [COUCHBASE]: {
    name: 'Couchbase',
    defaultPrimaryKeyType: TYPE_STRING,
  },
  [MONGODB]: {
    name: 'MongoDB',
    defaultPrimaryKeyType: TYPE_STRING,
    defaultPort: 27017,
  },
  [NEO4J]: {
    name: 'Neo4j',
    defaultPrimaryKeyType: TYPE_STRING,
    defaultPort: 7687,
  },
  [SQL]: {
    name: 'SQL',
    defaultPrimaryKeyType: TYPE_LONG,
  },
};

export const getDatabaseTypeData = (databaseType: string): DatabaseTypeData => databaseTypeData[databaseType] ?? databaseTypeDataFallback;
