/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
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

const expect = require('chai').expect;
const fs = require('fs');
const Exporter = require('../../../lib/export/jhipster_application_exporter');
const JDLParser = require('../../../lib/parser/jdl_parser');
const parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles;

const fail = expect.fail;

describe('JHipsterApplicationExporter', () => {
  describe('::exportApplication', () => {
    context('when passing invalid parameters', () => {
      context('such as undefined', () => {
        it('throws an error', () => {
          try {
            Exporter.exportApplication();
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
    });
    context('when passing valid arguments', () => {
      context('when exporting an application to JSON', () => {
        before(() => {
          Exporter.exportApplication(
            JDLParser.parse(
              parseFromFiles(['./test/test_files/application.jdl']),
              'sql',
              'monolith',
              'toto',
              '4.9.0'
            ).applications.toto
          );
        });
        after((done) => {
          fs.unlink('.yo-rc.json', done);
        });
        it('exports it', (done) => {
          fs.readFile('.yo-rc.json', { encoding: 'utf8' }, done);
        });
      });
    });
  });
  describe('::exportApplications', () => {
    context('when passing invalid parameters', () => {
      context('such as undefined', () => {
        it('throws an error', () => {
          try {
            Exporter.exportApplications();
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
    });
    context('when passing valid arguments', () => {
      context('when exporting an application to JSON', () => {
        before(() => {
          Exporter.exportApplications(
            JDLParser.parse(
              parseFromFiles(['./test/test_files/application.jdl']),
              'sql',
              'monolith',
              'toto',
              '4.9.0'
            ).applications
          );
        });
        after((done) => {
          fs.unlink('.yo-rc.json', done);
        });
        it('exports it', (done) => {
          fs.readFile('.yo-rc.json', { encoding: 'utf8' }, done);
        });
      });
    });
  });
});
