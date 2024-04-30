/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

/* eslint-disable no-new, no-unused-expressions */
import fs from 'fs';
import { expect } from 'chai';
import { it, describe, expect as jestExpect, beforeEach } from 'esmocha';
import JDLObject from '../models/jdl-object.js';
import { JDLEntity } from '../models/index.js';
import exportToJDL from '../exporters/jdl-exporter.js';
import JDLApplication from '../models/jdl-application.js';
import { applicationOptions, clientFrameworkTypes } from '../jhipster/index.js';
import { basicHelpers as helpers } from '../../testing/index.js';

const NO_CLIENT_FRAMEWORK = clientFrameworkTypes.NO;
const {
  OptionNames: { CLIENT_FRAMEWORK },
} = applicationOptions;

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
        let fileExistence;
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
          let fileExistence;
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
            let jdlObject;
            beforeEach(() => {
              jdlObject = new JDLObject();
              jdlObject.addApplication(new JDLApplication({ config: { [CLIENT_FRAMEWORK]: NO_CLIENT_FRAMEWORK } }));
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
