/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { exportApplication, exportApplications } = require('../../../lib/exporters/jhipster_application_exporter');
const { MONOLITH } = require('../../../lib/core/jhipster/application_types');
const { createJDLApplication } = require('../../../lib/core/jdl_application_factory');

describe('JHipsterApplicationExporter', () => {
  describe('exportApplication', () => {
    context('when passing invalid parameters', () => {
      context('such as undefined', () => {
        it('should fail', () => {
          expect(() => {
            exportApplication();
          }).to.throw('An application has to be passed to be exported.');
        });
      });
    });
    context('when passing valid arguments', () => {
      context('when exporting an application to JSON', () => {
        let content;
        let returned;

        before(done => {
          returned = exportApplication(
            createJDLApplication({
              applicationType: MONOLITH,
              baseName: 'toto',
              packageName: 'com.mathieu.sample',
              enableTranslation: false,
              languages: ['en', 'fr'],
              jhipsterVersion: '4.9.0',
              otherModules: ['MyModule'],
              creationTimestamp: 'new'
            })
          );
          fs.readFile(path.join('.yo-rc.json'), { encoding: 'utf8' }, (err, data) => {
            if (err) {
              return done(err);
            }
            content = JSON.parse(data);
            return done();
          });
        });

        after(() => {
          fs.unlinkSync(path.join('.yo-rc.json'));
        });

        it('should return the exported application', () => {
          expect(returned).to.deep.equal({
            entities: [],
            'generator-jhipster': {
              applicationType: 'monolith',
              authenticationType: 'jwt',
              baseName: 'toto',
              buildTool: 'maven',
              cacheProvider: 'ehcache',
              clientFramework: 'angularX',
              clientTheme: 'none',
              clientThemeVariant: '',
              clientPackageManager: 'npm',
              databaseType: 'sql',
              devDatabaseType: 'h2Disk',
              enableHibernateCache: true,
              enableSwaggerCodegen: false,
              enableTranslation: false,
              jhiPrefix: 'jhi',
              jhipsterVersion: '4.9.0',
              languages: ['en', 'fr'],
              messageBroker: false,
              nativeLanguage: 'en',
              otherModules: ['MyModule'],
              packageFolder: 'com/mathieu/sample',
              packageName: 'com.mathieu.sample',
              prodDatabaseType: 'mysql',
              searchEngine: false,
              serverPort: '8080',
              serviceDiscoveryType: false,
              skipClient: false,
              skipServer: false,
              skipUserManagement: false,
              testFrameworks: [],
              useSass: true,
              websocket: false,
              creationTimestamp: 'new'
            }
          });
        });
        it('should export it', () => {
          expect(content).not.to.be.undefined;
        });
        it('should format it', () => {
          expect(content['generator-jhipster']).not.to.be.undefined;
          const config = content['generator-jhipster'];
          expect(config).to.deep.equal({
            applicationType: 'monolith',
            authenticationType: 'jwt',
            baseName: 'toto',
            buildTool: 'maven',
            cacheProvider: 'ehcache',
            clientFramework: 'angularX',
            clientTheme: 'none',
            clientThemeVariant: '',
            clientPackageManager: 'npm',
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            enableSwaggerCodegen: false,
            enableTranslation: false,
            enableHibernateCache: true,
            jhiPrefix: 'jhi',
            jhipsterVersion: '4.9.0',
            languages: ['en', 'fr'],
            messageBroker: false,
            nativeLanguage: 'en',
            otherModules: ['MyModule'],
            packageFolder: 'com/mathieu/sample',
            packageName: 'com.mathieu.sample',
            prodDatabaseType: 'mysql',
            searchEngine: false,
            serverPort: '8080',
            serviceDiscoveryType: false,
            skipClient: false,
            skipServer: false,
            skipUserManagement: false,
            testFrameworks: [],
            useSass: true,
            websocket: false,
            creationTimestamp: 'new'
          });
        });
      });
      context('when exporting an application to JSON with skipYoRcGeneration', () => {
        before(() => {
          exportApplication(
            createJDLApplication({
              applicationType: MONOLITH,
              baseName: 'toto',
              packageName: 'com.mathieu.sample',
              enableTranslation: false,
              languages: ['en', 'fr'],
              jhipsterVersion: '4.9.0',
              otherModules: ['MyModule']
            }),
            { skipYoRcGeneration: true }
          );
        });

        it('should not create the .yo-rc.json in the current folder', () => {
          expect(() => fs.statSync('.yo-rc.json')).to.throw();
        });
      });
      context('when exporting an application to JSON with creationTimestampConfig', () => {
        let content;
        before(() => {
          exportApplication(
            createJDLApplication({
              applicationType: MONOLITH,
              baseName: 'toto',
              packageName: 'com.mathieu.sample',
              enableTranslation: false,
              languages: ['en', 'fr'],
              jhipsterVersion: '4.9.0',
              otherModules: ['MyModule']
            }),
            { creationTimestampConfig: 1546300800000 }
          );
          content = JSON.parse(fs.readFileSync(path.join('.yo-rc.json'), { encoding: 'utf8' }));
        });

        after(() => {
          fs.unlinkSync(path.join('.yo-rc.json'));
        });

        it('sets creationTimestamp on .yo-rc.json', () => {
          expect(content['generator-jhipster']).not.to.be.undefined;
          expect(content['generator-jhipster'].creationTimestamp).to.equal(1546300800000);
        });
      });
      context('when exporting an existing application to JSON', () => {
        let content;

        before(() => {
          fs.writeFileSync(
            '.yo-rc.json',
            JSON.stringify(
              {
                'generator-jhipster': {
                  jwtSecretKey: '1234',
                  creationTimestamp: 'old'
                },
                test: 1234
              },
              null,
              2
            )
          );
          exportApplication(
            createJDLApplication({
              applicationType: MONOLITH,
              baseName: 'toto',
              packageName: 'com.mathieu.sample',
              enableTranslation: false,
              languages: ['en', 'fr'],
              jhipsterVersion: '4.9.0',
              creationTimestamp: 'new'
            })
          );
          content = JSON.parse(fs.readFileSync(path.join('.yo-rc.json'), { encoding: 'utf8' }));
        });
        after(() => {
          fs.unlinkSync(path.join('.yo-rc.json'));
        });

        it('should not override the creationTimestamp value', () => {
          expect(content['generator-jhipster'].creationTimestamp).to.equal('old');
        });

        it('should add the read content to the exported application', () => {
          expect(content).to.deep.equal({
            entities: [],
            test: 1234,
            'generator-jhipster': {
              applicationType: 'monolith',
              authenticationType: 'jwt',
              baseName: 'toto',
              buildTool: 'maven',
              cacheProvider: 'ehcache',
              clientFramework: 'angularX',
              clientTheme: 'none',
              clientThemeVariant: '',
              clientPackageManager: 'npm',
              databaseType: 'sql',
              devDatabaseType: 'h2Disk',
              enableHibernateCache: true,
              enableSwaggerCodegen: false,
              enableTranslation: false,
              jhiPrefix: 'jhi',
              jhipsterVersion: '4.9.0',
              languages: ['en', 'fr'],
              messageBroker: false,
              nativeLanguage: 'en',
              packageFolder: 'com/mathieu/sample',
              packageName: 'com.mathieu.sample',
              prodDatabaseType: 'mysql',
              searchEngine: false,
              serverPort: '8080',
              serviceDiscoveryType: false,
              skipClient: false,
              skipServer: false,
              skipUserManagement: false,
              testFrameworks: [],
              useSass: true,
              websocket: false,
              jwtSecretKey: '1234',
              creationTimestamp: 'old'
            }
          });
        });
      });
      context('when the application has the blueprints option', () => {
        let returned;

        before(() => {
          returned = exportApplication(
            createJDLApplication({
              baseName: 'toto',
              blueprints: ['generator-jhipster-vuejs', 'generator-jhipster-nodejs']
            })
          );
        });

        after(() => {
          fs.unlinkSync(path.join('.yo-rc.json'));
        });

        it('should format it', () => {
          expect(returned['generator-jhipster'].blueprints).to.deep.equal([
            {
              name: 'generator-jhipster-vuejs'
            },
            {
              name: 'generator-jhipster-nodejs'
            }
          ]);
        });
      });
    });
  });
  describe('exportApplications', () => {
    context('when passing invalid parameters', () => {
      context('such as undefined', () => {
        it('should fail', () => {
          expect(() => {
            exportApplications();
          }).to.throw('Applications have to be passed to be exported.');
        });
      });
    });
    context('when passing valid arguments', () => {
      context('when exporting applications to JSON', () => {
        let returned;

        before('common setup for both applications', () => {
          returned = exportApplications({
            toto: createJDLApplication({
              applicationType: MONOLITH,
              baseName: 'toto',
              packageName: 'com.mathieu.toto',
              enableTranslation: false,
              languages: ['en', 'fr'],
              jhipsterVersion: '4.9.0'
            }),
            titi: createJDLApplication({
              applicationType: MONOLITH,
              baseName: 'titi',
              packageName: 'com.mathieu.titi',
              enableTranslation: false,
              languages: ['en', 'fr'],
              jhipsterVersion: '4.9.0'
            })
          });
        });

        it('should return the exported applications', () => {
          expect(returned).to.have.lengthOf(2);
        });
        context('for the first application', () => {
          let content;

          before('setup for the first application', done => {
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

          it('should export it', done => {
            fs.readFile(path.join('toto', '.yo-rc.json'), { encoding: 'utf8' }, done);
          });

          it('should format it', () => {
            expect(content['generator-jhipster']).not.to.be.undefined;
            const config = content['generator-jhipster'];
            expect(config).to.deep.equal({
              applicationType: 'monolith',
              authenticationType: 'jwt',
              baseName: 'toto',
              buildTool: 'maven',
              cacheProvider: 'ehcache',
              clientFramework: 'angularX',
              clientTheme: 'none',
              clientThemeVariant: '',
              clientPackageManager: 'npm',
              databaseType: 'sql',
              devDatabaseType: 'h2Disk',
              enableSwaggerCodegen: false,
              enableTranslation: false,
              enableHibernateCache: true,
              jhiPrefix: 'jhi',
              jhipsterVersion: '4.9.0',
              languages: ['en', 'fr'],
              messageBroker: false,
              nativeLanguage: 'en',
              packageFolder: 'com/mathieu/toto',
              packageName: 'com.mathieu.toto',
              prodDatabaseType: 'mysql',
              searchEngine: false,
              serverPort: '8080',
              serviceDiscoveryType: false,
              skipClient: false,
              skipServer: false,
              skipUserManagement: false,
              testFrameworks: [],
              useSass: true,
              websocket: false
            });
          });
        });
        context('for the second application', () => {
          let content;

          before('setup for the first application', done => {
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

          it('should export it', done => {
            fs.readFile(path.join('titi', '.yo-rc.json'), { encoding: 'utf8' }, done);
          });

          it('should format it', () => {
            expect(content['generator-jhipster']).not.to.be.undefined;
            const config = content['generator-jhipster'];
            expect(config).to.deep.equal({
              applicationType: 'monolith',
              authenticationType: 'jwt',
              baseName: 'titi',
              buildTool: 'maven',
              cacheProvider: 'ehcache',
              clientFramework: 'angularX',
              clientTheme: 'none',
              clientThemeVariant: '',
              clientPackageManager: 'npm',
              databaseType: 'sql',
              devDatabaseType: 'h2Disk',
              enableSwaggerCodegen: false,
              enableTranslation: false,
              enableHibernateCache: true,
              jhiPrefix: 'jhi',
              jhipsterVersion: '4.9.0',
              languages: ['en', 'fr'],
              messageBroker: false,
              nativeLanguage: 'en',
              packageFolder: 'com/mathieu/titi',
              packageName: 'com.mathieu.titi',
              prodDatabaseType: 'mysql',
              searchEngine: false,
              serverPort: '8080',
              serviceDiscoveryType: false,
              skipClient: false,
              skipServer: false,
              skipUserManagement: false,
              testFrameworks: [],
              useSass: true,
              websocket: false
            });
          });
        });
      });
    });
  });
});
