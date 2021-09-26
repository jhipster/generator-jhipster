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
const {
  GENERATOR_CLIENT,
  GENERATOR_COMMON,
  GENERATOR_CYPRESS,
  GENERATOR_ENTITY_I_18_N,
  GENERATOR_ENTITY_CLIENT,
  GENERATOR_ENTITIES_CLIENT,
} = require('../generators/generator-list');

const readDir = dirPath => {
  const files = [];
  const dir = fs.opendirSync(dirPath);
  let dirent = dir.readSync();
  while (dirent !== null) {
    const childPath = path.join(dirPath, dirent.name);
    if (dirent.isFile()) {
      files.push(childPath);
    } else {
      files.push(...readDir(childPath));
    }
    dirent = dir.readSync();
  }
  dir.closeSync();
  return files;
};

describe('Enforce some developments patterns', () => {
  describe('at client/common generators', () => {
    const filesToTest = [
      ...readDir(path.join(__dirname, '..', 'generators', GENERATOR_CLIENT)),
      ...readDir(path.join(__dirname, '..', 'generators', GENERATOR_COMMON)),
      ...readDir(path.join(__dirname, '..', 'generators', GENERATOR_CYPRESS)),
      ...readDir(path.join(__dirname, '..', 'generators', GENERATOR_ENTITY_I_18_N)),
      ...readDir(path.join(__dirname, '..', 'generators', GENERATOR_ENTITY_CLIENT)),
      ...readDir(path.join(__dirname, '..', 'generators', GENERATOR_ENTITIES_CLIENT)),
    ];
    filesToTest.forEach(file => {
      describe(`file ${path.basename(file)}`, () => {
        let content;
        before(() => {
          content = fse.readFileSync(file, 'utf-8');
        });

        [
          ['src/main/webapp', '<%= CLIENT_MAIN_SRC_DIR %>'],
          ['src/test/javascript', '<%= CLIENT_TEST_SRC_DIR %>'],
          [' Java ', ' <%= backendName %> '],
        ].forEach(([notSpected, replacement]) => {
          const regex = new RegExp(notSpected, 'g');
          const regexSeparator = new RegExp(`${notSpected}/`, 'g');
          before(() => {
            if (!process.argv.includes('--fix-enforcements') || !replacement) return;
            if (file.endsWith('.ejs')) {
              if (regexSeparator.test(content)) {
                fse.writeFileSync(file, content.replace(regexSeparator, replacement));
                content = fse.readFileSync(file, 'utf-8');
              }
              if (regex.test(content)) {
                fse.writeFileSync(file, content.replace(regex, replacement));
                content = fse.readFileSync(file, 'utf-8');
              }
            }
          });
          it(`should not contain ${notSpected}`, () => {
            assert(!regex.test(content), `file ${file} should not contain ${notSpected}`);
          });
        });
      });
    });
  });

  describe('at generators base', () => {
    const filesToTest = [
      path.join(__dirname, '..', 'generators', 'generator-base-private.js'),
      path.join(__dirname, '..', 'generators', 'generator-base.js'),
    ];
    filesToTest.forEach(file => {
      describe(`file ${path.basename(file)}`, () => {
        let content;
        before(() => {
          content = fse.readFileSync(file, 'utf-8');
        });

        ['src/main/webapp', 'src/test/javascript'].forEach(notSpected => {
          const regex = new RegExp(notSpected, 'g');
          it(`should not contain ${notSpected}`, () => {
            assert(!regex.test(content), `file ${file} should not contain ${notSpected}`);
          });
        });
      });
    });
  });
});
