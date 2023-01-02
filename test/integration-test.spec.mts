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
import assert from 'assert';
import fs from 'fs';
import fse from 'fs-extra';
import path, { dirname } from 'path';
import sortKeys from 'sort-keys';
import { fileURLToPath } from 'url';

import { applicationTypes, authenticationTypes } from '../jdl/jhipster/index.mjs';
import { formatDateForChangelog } from '../generators/base/utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { JWT, SESSION } = authenticationTypes;
const { GATEWAY, MICROSERVICE } = applicationTypes;

const fixSamples = process.argv.includes('--fix-samples');
const itSamplesPath = path.join(__dirname, '..', 'test-integration', 'samples');
const itEntitiesSamplesPath = path.join(__dirname, '..', 'test-integration', 'samples', '.jhipster');
const REMENBER_ME_KEY = 'a5e93fdeb16e2ee2dc4a629b5dbdabb30f968e418dfc0483c53afdc695cfac96d06cf5c581cbefb93e3aaa241880857fcafe';
const JWT_SECRET_KEY =
  'ZjY4MTM4YjI5YzMwZjhjYjI2OTNkNTRjMWQ5Y2Q0Y2YwOWNmZTE2NzRmYzU3NTMwM2NjOTE3MTllOTM3MWRkMzcyYTljMjVmNmQ0Y2MxOTUzODc0MDhhMTlkMDIxMzI2YzQzZDM2ZDE3MmQ3NjVkODk3OTVmYzljYTQyZDNmMTQ=';

const itSamplesEntries = fs
  .readdirSync(itSamplesPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(({ name }) => name)
  .map(name => [name, path.join(itSamplesPath, name, '.yo-rc.json')])
  .filter(([name, yoFile]) => fs.existsSync(yoFile));
const itEntitiesSamplesEntries = fs
  .readdirSync(itEntitiesSamplesPath, { withFileTypes: true })
  .filter(dirent => dirent.isFile())
  .map(({ name }) => name)
  .map(name => [name, path.join(itEntitiesSamplesPath, name)]);

describe('Integration Test', () => {
  describe('::application samples', () => {
    for (const [name, yoFile] of itSamplesEntries) {
      let yoJson = fse.readJsonSync(yoFile);
      const config = yoJson['generator-jhipster'];
      describe(`${name} test`, () => {
        before(() => {
          if (fixSamples) {
            if (!config.creationTimestamp) {
              config.creationTimestamp = 1596513172471;
              fse.writeJsonSync(yoFile, yoJson);
            }
            if (config.authenticationType === SESSION && config.rememberMeKey !== REMENBER_ME_KEY) {
              config.rememberMeKey = REMENBER_ME_KEY;
              fse.writeJsonSync(yoFile, yoJson);
            } else if (
              (config.authenticationType === JWT || config.applicationType === MICROSERVICE || config.applicationType === GATEWAY) &&
              config.jwtSecretKey !== JWT_SECRET_KEY
            ) {
              config.jwtSecretKey = JWT_SECRET_KEY;
              fse.writeJsonSync(yoFile, yoJson);
            }
            const yoJsonOrdered = sortKeys(yoJson, { deep: true });
            if (JSON.stringify(yoJson) !== JSON.stringify(yoJsonOrdered)) {
              fse.writeJsonSync(yoFile, yoJsonOrdered);
              yoJson = yoJsonOrdered;
            }
          }
        });
        it('should contain creationTimestamp', () => {
          assert(config.creationTimestamp);
        });
        if (config.authenticationType === JWT || config.applicationType === MICROSERVICE || config.applicationType === GATEWAY) {
          it('should contain jwtSecretKey', () => {
            assert(config.jwtSecretKey);
          });
        } else if (config.authenticationType === SESSION) {
          it('should contain rememberMeKey', () => {
            assert(config.rememberMeKey);
          });
        }
        it('should be ordered', () => {
          assert(JSON.stringify(yoJson) === JSON.stringify(sortKeys(yoJson, { deep: true })));
        });
      });
    }
  });

  describe('::entities samples reproducibility', () => {
    const changelogDates = [];
    for (const [name, entitySample] of itEntitiesSamplesEntries) {
      let entityJson = fse.readJsonSync(entitySample);
      before(() => {
        if (fixSamples) {
          const entityJsonOrdered = sortKeys(entityJson, { deep: true });
          if (JSON.stringify(entityJson) !== JSON.stringify(entityJsonOrdered)) {
            fse.writeJsonSync(entitySample, entityJsonOrdered);
            entityJson = entityJsonOrdered;
          }
        }
      });
      it(`${name} contains changelogDate`, () => {
        if (fixSamples) {
          if (!entityJson.changelogDate) {
            entityJson.changelogDate = formatDateForChangelog(new Date());
            fse.writeJsonSync(entitySample, entityJson);
          }
        }
        assert(entityJson.changelogDate);
      });
      it(`${name} does not contains duplicate changelogDate`, () => {
        if (fixSamples) {
          while (changelogDates.includes(entityJson.changelogDate)) {
            entityJson.changelogDate = formatDateForChangelog(new Date());
            fse.writeJsonSync(entitySample, entityJson);
          }
        }
        assert(!changelogDates.includes(entityJson.changelogDate));
        changelogDates.push(entityJson.changelogDate);
      });
      it(`${name} should be ordered`, () => {
        assert.strictEqual(JSON.stringify(entityJson), JSON.stringify(sortKeys(entityJson, { deep: true })));
      });
    }
  });
});
