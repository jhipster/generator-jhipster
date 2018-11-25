/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-new, no-unused-expressions */
const { expect } = require('chai');

const fs = require('fs');
const JDLObject = require('../../../lib/core/jdl_object');
const JDLEntity = require('../../../lib/core/jdl_entity');
const JDLExporter = require('../../../lib/export/jdl_exporter');

describe('JDLExporter', () => {
  describe('::exportToJDL', () => {
    context('when passing invalid parameters', () => {
      context('such as undefined', () => {
        it('throws an error', () => {
          expect(() => {
            JDLExporter.exportToJDL();
          }).to.throw('A JDLObject has to be passed to be exported.');
        });
      });
    });
    context('when passing valid parameters', () => {
      context('with a path', () => {
        const PATH = 'myPath.jdl';
        let fileExistence = null;
        let jdlContent = '';

        before(() => {
          const jdlObject = new JDLObject();
          jdlObject.addEntity(
            new JDLEntity({
              name: 'Toto'
            })
          );
          JDLExporter.exportToJDL(jdlObject, PATH);
          fileExistence = fs.statSync(PATH).isFile();
          jdlContent = fs.readFileSync(PATH, 'utf-8').toString();
        });

        after(() => {
          fs.unlinkSync(PATH);
        });

        it('exports the JDL to the passed path', () => {
          expect(fileExistence).to.be.true;
        });
        it('writes the JDL inside the file', () => {
          expect(jdlContent).to.equal('entity Toto\n');
        });
      });
      context('without a path', () => {
        const DEFAULT_PATH = './jhipster-jdl.jh';
        let fileExistence = null;
        let jdlContent = '';

        before(() => {
          const jdlObject = new JDLObject();
          jdlObject.addEntity(
            new JDLEntity({
              name: 'Toto'
            })
          );
          JDLExporter.exportToJDL(jdlObject);
          fileExistence = fs.statSync(DEFAULT_PATH).isFile();
          jdlContent = fs.readFileSync(DEFAULT_PATH, 'utf-8').toString();
        });

        after(() => {
          fs.unlinkSync(DEFAULT_PATH);
        });

        it('exports the JDL to the default one', () => {
          expect(fileExistence).to.be.true;
        });
        it('writes the JDL inside the file', () => {
          expect(jdlContent).to.equal('entity Toto\n');
        });
      });
    });
  });
});
