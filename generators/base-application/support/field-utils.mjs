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
import { fieldTypes } from '../../../jdl/jhipster/index.mjs';

const { CommonDBTypes, RelationalOnlyDBTypes } = fieldTypes;
const { BYTES, BYTE_BUFFER } = RelationalOnlyDBTypes;
const {
  BOOLEAN,
  BIG_DECIMAL,
  DOUBLE,
  DURATION,
  FLOAT,
  INSTANT,
  INTEGER,
  LOCAL_DATE,
  LONG,
  STRING,
  UUID,
  ZONED_DATE_TIME,
  IMAGE_BLOB,
  ANY_BLOB,
  TEXT_BLOB,
  BLOB,
} = CommonDBTypes;

// eslint-disable-next-line import/prefer-default-export
export function fieldIsEnum(fieldType) {
  return ![
    STRING,
    INTEGER,
    LONG,
    FLOAT,
    DOUBLE,
    BIG_DECIMAL,
    LOCAL_DATE,
    INSTANT,
    ZONED_DATE_TIME,
    DURATION,
    UUID,
    BOOLEAN,
    BYTES,
    BYTE_BUFFER,
    ANY_BLOB,
    BLOB,
    IMAGE_BLOB,
    TEXT_BLOB,
  ].includes(fieldType);
}
