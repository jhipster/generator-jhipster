/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { beforeEach, describe, expect as jestExpect, it } from 'esmocha';
import fs from 'node:fs';

import { expect } from 'chai';
import helpers from 'yeoman-test';

import { JDLEntity } from '../../core/models/index.ts';
import JDLApplication from '../../core/models/jdl-application.ts';
import JDLObject from '../../core/models/jdl-object.ts';
import type { JDLJSONApplicationConfiguration } from '../../core/parsing/jdl-parsing-types.ts';
import { createRuntime } from '../../core/runtime.ts';

import exportToJDL from './jdl-exporter.ts';

const runtime = createRuntime();

describe('jdl - JDLExporter', () => {
  beforeEach(async () => {
    await helpers.prepareTemporaryDir();
  });
  describe('exportToJDL', () => {
    describe('when passing invalid parameters', () => {
      describe('such as undefined', () => {
        it('should fail', () => {
          expect(() => {
            // @ts-expect-error
            exportToJDL();
          }).to.throw(/^A JDLObject has to be passed to be exported\.$/);
        });
      });
    });
    describe('when passing valid parameters', () => {
      describe('with a path', () => {
        const PATH = 'myPath.jdl';
        let fileExistence: boolean;
        let jdlContent = '';

        beforeEach(() => {
          const jdlObject = new JDLObject();
          jdlObject.addEntity(
            new JDLEntity({
              name: 'Toto',
            }),
          );
          exportToJDL(jdlObject, PATH);
          fileExistence = fs.statSync(PATH).isFile();
          jdlContent = fs.readFileSync(PATH, 'utf-8').toString();
        });

        it('should export the JDL to the passed path', () => {
          expect(fileExistence).to.be.true;
        });
        it('should write the JDL inside the file', () => {
          expect(jdlContent).to.equal('entity Toto\n');
        });
      });
      describe('without a path', () => {
        describe('exports entity', () => {
          const DEFAULT_PATH = 'app.jdl';
          let fileExistence: boolean;
          let jdlContent = '';

          beforeEach(() => {
            const jdlObject = new JDLObject();
            jdlObject.addEntity(
              new JDLEntity({
                name: 'Toto',
              }),
            );
            exportToJDL(jdlObject);
            fileExistence = fs.statSync(DEFAULT_PATH).isFile();
            jdlContent = fs.readFileSync(DEFAULT_PATH, 'utf-8').toString();
          });

          it('should export the JDL to the default one', () => {
            expect(fileExistence).to.be.true;
          });
          it('should write the JDL inside the file', () => {
            expect(jdlContent).to.equal('entity Toto\n');
          });
        });
        describe('exports application', () => {
          describe('with clientFramework no', () => {
            let jdlObject: JDLObject;
            beforeEach(() => {
              jdlObject = new JDLObject();
              const jdlApplication: JDLJSONApplicationConfiguration = {
                config: { clientFramework: 'no' },
              };
              jdlObject.addApplication(new JDLApplication(jdlApplication, runtime));
            });

            it('should export the JDL and match snapshot', () => {
              jestExpect(exportToJDL(jdlObject)).toMatchInlineSnapshot(`
"application {
  config {
    clientFramework no
  }
}
"
`);
            });
          });
        });
      });
    });
  });
});
