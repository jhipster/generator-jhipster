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

/* eslint-disable no-new, no-unused-expressions */
import { expect } from 'chai';
import { jestExpect } from 'mocha-expect-snapshot';

import fs from 'fs';
import JDLObject from '../../../jdl/models/jdl-object.js';
import { JDLEntity } from '../../../jdl/models/index.mjs';
import exportToJDL from '../../../jdl/exporters/jdl-exporter.js';
import JDLApplication from '../../../jdl/models/jdl-application.js';
import { applicationOptions, clientFrameworkTypes } from '../../../jdl/jhipster/index.mjs';

const NO_CLIENT_FRAMEWORK = clientFrameworkTypes.NO;
const {
  OptionNames: { CLIENT_FRAMEWORK },
} = applicationOptions;

describe('JDLExporter', () => {
  describe('exportToJDL', () => {
    context('when passing invalid parameters', () => {
      context('such as undefined', () => {
        it('should fail', () => {
          expect(() => {
            // @ts-expect-error
            exportToJDL();
          }).to.throw(/^A JDLObject has to be passed to be exported\.$/);
        });
      });
    });
    context('when passing valid parameters', () => {
      context('with a path', () => {
        const PATH = 'myPath.jdl';
        let fileExistence;
        let jdlContent = '';

        before(() => {
          const jdlObject = new JDLObject();
          jdlObject.addEntity(
            new JDLEntity({
              name: 'Toto',
            })
          );
          exportToJDL(jdlObject, PATH);
          fileExistence = fs.statSync(PATH).isFile();
          jdlContent = fs.readFileSync(PATH, 'utf-8').toString();
        });

        after(() => {
          fs.unlinkSync(PATH);
        });

        it('should export the JDL to the passed path', () => {
          expect(fileExistence).to.be.true;
        });
        it('should write the JDL inside the file', () => {
          expect(jdlContent).to.equal('entity Toto\n');
        });
      });
      context('without a path', () => {
        context('exports entity', () => {
          const DEFAULT_PATH = 'app.jdl';
          let fileExistence;
          let jdlContent = '';

          before(() => {
            const jdlObject = new JDLObject();
            jdlObject.addEntity(
              new JDLEntity({
                name: 'Toto',
              })
            );
            exportToJDL(jdlObject);
            fileExistence = fs.statSync(DEFAULT_PATH).isFile();
            jdlContent = fs.readFileSync(DEFAULT_PATH, 'utf-8').toString();
          });

          after(() => {
            fs.unlinkSync(DEFAULT_PATH);
          });

          it('should export the JDL to the default one', () => {
            expect(fileExistence).to.be.true;
          });
          it('should write the JDL inside the file', () => {
            expect(jdlContent).to.equal('entity Toto\n');
          });
        });
        context('exports application', () => {
          context('with clientFramework no', () => {
            let jdlObject;
            before(() => {
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
