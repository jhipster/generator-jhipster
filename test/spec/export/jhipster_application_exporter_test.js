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

/* eslint-disable no-unused-expressions */

const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const Exporter = require('../../../lib/export/jhipster_application_exporter');
const DocumentParser = require('../../../lib/parser/document_parser');
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
      context('such as an invalid application', () => {
        it('throws an error', () => {
          try {
            Exporter.exportApplication({
              config: {}
            });
            fail();
          } catch (error) {
            expect(error.name).to.eq('InvalidObjectException');
          }
        });
      });
      context('such as an invalid path as baseName', () => {
        before((done) => {
          fs.writeFile('aFile', '', {}, done);
        });
        after((done) => {
          fs.unlink('aFile', done);
        });

        it('throws an error', () => {
          try {
            Exporter.exportApplication(
              DocumentParser.parse(
                parseFromFiles(['./test/test_files/application_wrong_basename.jdl']),
                'sql',
                'monolith',
                'toto',
                '4.9.0'
              ).applications.aFile
            );
            fail();
          } catch (error) {
            expect(error.name).to.eq('WrongDirException');
          }
        });
      });
    });
    context('when passing valid arguments', () => {
      context('when exporting an application to JSON', () => {
        let content = null;

        before((done) => {
          Exporter.exportApplication(
            DocumentParser.parse(
              parseFromFiles(['./test/test_files/application.jdl']),
              'sql',
              'monolith',
              'toto',
              '4.9.0'
            ).applications.toto
          );
          fs.readFile(path.join('toto', '.yo-rc.json'), { encoding: 'utf8' }, (err, data) => {
            if (err) {
              return done(err);
            }
            content = JSON.parse(data);
            return done();
          });
        });

        after((done) => {
          fs.unlink(path.join('toto', '.yo-rc.json'), () => {
            fs.rmdir('toto', done);
          });
        });

        it('exports it', () => {
          expect(content).not.to.be.undefined;
        });
        it('formats it', () => {
          expect(content['generator-jhipster']).not.to.be.undefined;
          const config = content['generator-jhipster'];
          expect(config.jwtSecretKey).not.to.be.undefined;
          delete config.jwtSecretKey;
          expect(config).to.deep.equal({
            applicationType: 'monolith',
            authenticationType: 'jwt',
            baseName: 'toto',
            buildTool: 'maven',
            clientFramework: 'angular1',
            clientPackageManager: 'yarn',
            clusteredHttpSession: 'no',
            databaseType: 'sql',
            devDatabaseType: 'h2Memory',
            enableSocialSignIn: false,
            enableSwaggerCodegen: false,
            enableTranslation: false,
            hibernateCache: 'no',
            jhiPrefix: 'jhi',
            jhipsterVersion: '4.9.0',
            languages: [
              'en',
              'fr'
            ],
            messageBroker: false,
            nativeLanguage: 'en',
            packageFolder: 'com/mathieu/sample',
            packageName: 'com.mathieu.sample',
            prodDatabaseType: 'mysql',
            searchEngine: false,
            serverPort: 8080,
            serviceDiscoveryType: false,
            skipClient: false,
            skipServer: false,
            skipUserManagement: false,
            testFrameworks: [],
            useCompass: false,
            useSass: false,
            websocket: false
          });
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
      context('when exporting applications to JSON', () => {
        before('common setup for both applications', () => {
          Exporter.exportApplications(
            DocumentParser.parse(
              parseFromFiles([path.join('test', 'test_files', 'applications.jdl')]),
              'sql',
              'monolith',
              'toto',
              '4.9.0'
            ).applications
          );
        });

        context('for the first application', () => {
          let content = null;

          before('setup for the first application', (done) => {
            fs.readFile(path.join('toto', '.yo-rc.json'), { encoding: 'utf8' }, (err, data) => {
              if (err) {
                return done(err);
              }
              content = JSON.parse(data);
              return done();
            });
          });

          after('cleanup for the fist application', () => {
            fs.unlinkSync(path.join('toto', '.yo-rc.json'));
            fs.rmdirSync('toto');
          });

          it('exports it', (done) => {
            fs.readFile(path.join('toto', '.yo-rc.json'), { encoding: 'utf8' }, done);
          });

          it('formats it', () => {
            expect(content['generator-jhipster']).not.to.be.undefined;
            const config = content['generator-jhipster'];
            expect(config.jwtSecretKey).not.to.be.undefined;
            delete config.jwtSecretKey;
            expect(config).to.deep.equal({
              applicationType: 'monolith',
              authenticationType: 'jwt',
              baseName: 'toto',
              buildTool: 'maven',
              clientFramework: 'angular1',
              clientPackageManager: 'yarn',
              clusteredHttpSession: 'no',
              databaseType: 'sql',
              devDatabaseType: 'h2Memory',
              enableSocialSignIn: false,
              enableSwaggerCodegen: false,
              enableTranslation: false,
              hibernateCache: 'no',
              jhiPrefix: 'jhi',
              jhipsterVersion: '4.9.0',
              languages: [
                'en',
                'fr'
              ],
              messageBroker: false,
              nativeLanguage: 'en',
              packageFolder: 'com/mathieu/toto',
              packageName: 'com.mathieu.toto',
              prodDatabaseType: 'mysql',
              searchEngine: false,
              serverPort: 8080,
              serviceDiscoveryType: false,
              skipClient: false,
              skipServer: false,
              skipUserManagement: false,
              testFrameworks: [],
              useCompass: false,
              useSass: false,
              websocket: false
            });
          });
        });

        context('for the second application', () => {
          let content = null;

          before('setup for the first application', (done) => {
            fs.readFile(path.join('titi', '.yo-rc.json'), { encoding: 'utf8' }, (err, data) => {
              if (err) {
                return done(err);
              }
              content = JSON.parse(data);
              return done();
            });
          });

          after('cleanup for the fist application', () => {
            fs.unlinkSync(path.join('titi', '.yo-rc.json'));
            fs.rmdirSync('titi');
          });

          it('exports it', (done) => {
            fs.readFile(path.join('titi', '.yo-rc.json'), { encoding: 'utf8' }, done);
          });

          it('formats it', () => {
            expect(content['generator-jhipster']).not.to.be.undefined;
            const config = content['generator-jhipster'];
            expect(config.jwtSecretKey).not.to.be.undefined;
            delete config.jwtSecretKey;
            expect(config).to.deep.equal({
              applicationType: 'monolith',
              authenticationType: 'jwt',
              baseName: 'titi',
              buildTool: 'maven',
              clientFramework: 'angular1',
              clientPackageManager: 'yarn',
              clusteredHttpSession: 'no',
              databaseType: 'sql',
              devDatabaseType: 'h2Memory',
              enableSocialSignIn: false,
              enableSwaggerCodegen: false,
              enableTranslation: false,
              hibernateCache: 'no',
              jhiPrefix: 'jhi',
              jhipsterVersion: '4.9.0',
              languages: [
                'en',
                'fr'
              ],
              messageBroker: false,
              nativeLanguage: 'en',
              packageFolder: 'com/mathieu/titi',
              packageName: 'com.mathieu.titi',
              prodDatabaseType: 'mysql',
              searchEngine: false,
              serverPort: 8080,
              serviceDiscoveryType: false,
              skipClient: false,
              skipServer: false,
              skipUserManagement: false,
              testFrameworks: [],
              useCompass: false,
              useSass: false,
              websocket: false
            });
          });
        });
      });
    });
  });
});
