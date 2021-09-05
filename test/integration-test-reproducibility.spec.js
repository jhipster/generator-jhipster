/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const assert = require('assert');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const { JWT, SESSION } = require('../jdl/jhipster/authentication-types');

const { formatDateForChangelog } = require('../utils/liquibase');

describe('Integration Test reproducibility', () => {
  describe('::application samples reproducibility', () => {
    const itPath = path.join(__dirname, '..', 'test-integration', 'samples');
    const dir = fs.opendirSync(itPath);
    let dirent = dir.readSync();
    while (dirent !== null) {
      const yoFile = path.join(itPath, dirent.name, '.yo-rc.json');
      if (dirent.isDirectory() && fs.existsSync(yoFile)) {
        const yoJson = fse.readJsonSync(yoFile);
        const config = yoJson['generator-jhipster'];
        describe(`${dirent.name} test`, () => {
          before(() => {
            if (process.argv.includes('--fix-reproducibility')) {
              if (!config.creationTimestamp) {
                config.creationTimestamp = 1596513172471;
                fse.writeJsonSync(yoFile, yoJson);
              }
              if (config.authenticationType === SESSION && !config.rememberMeKey) {
                config.rememberMeKey =
                  'a5e93fdeb16e2ee2dc4a629b5dbdabb30f968e418dfc0483c53afdc695cfac96d06cf5c581cbefb93e3aaa241880857fcafe';
                fse.writeJsonSync(yoFile, yoJson);
              } else if (config.authenticationType === JWT && !config.jwtSecretKey) {
                config.jwtSecretKey =
                  'ZjY4MTM4YjI5YzMwZjhjYjI2OTNkNTRjMWQ5Y2Q0Y2YwOWNmZTE2NzRmYzU3NTMwM2NjOTE3MTllOTM3MWRkMzcyYTljMjVmNmQ0Y2MxOTUzODc0MDhhMTlkMDIxMzI2YzQzZDM2ZDE3MmQ3NjVkODk3OTVmYzljYTQyZDNmMTQ=';
                fse.writeJsonSync(yoFile, yoJson);
              }
            }
          });
          it('should contain creationTimestamp', () => {
            assert(config.creationTimestamp);
          });
          if (config.authenticationType === JWT) {
            it('should contain jwtSecretKey', () => {
              assert(config.jwtSecretKey);
            });
          } else if (config.authenticationType === SESSION) {
            it('should contain rememberMeKey', () => {
              assert(config.rememberMeKey);
            });
          }
        });
      }
      dirent = dir.readSync();
    }
    dir.closeSync();
  });

  describe('::entities samples reproducibility', () => {
    const changelogDates = [];
    const itPath = path.join(__dirname, '..', 'test-integration', 'samples', '.jhipster');
    const dir = fs.opendirSync(itPath);
    let dirent = dir.readSync();
    while (dirent !== null) {
      const entityFile = path.join(itPath, dirent.name);
      if (dirent.isFile()) {
        const entityJson = fse.readJsonSync(entityFile);
        it(`${dirent.name} contains changelogDate`, () => {
          if (process.argv.includes('--fix-reproducibility')) {
            if (!entityJson.changelogDate) {
              entityJson.changelogDate = formatDateForChangelog(new Date());
              fse.writeJsonSync(entityFile, entityJson);
            }
          }
          assert(entityJson.changelogDate);
        });
        it(`${dirent.name} does not contains duplicate changelogDate`, () => {
          if (process.argv.includes('--fix-reproducibility')) {
            while (changelogDates.includes(entityJson.changelogDate)) {
              entityJson.changelogDate = formatDateForChangelog(new Date());
              fse.writeJsonSync(entityFile, entityJson);
            }
          }
          assert(!changelogDates.includes(entityJson.changelogDate));
          changelogDates.push(entityJson.changelogDate);
        });
      }
      dirent = dir.readSync();
    }
    dir.closeSync();
  });
});
