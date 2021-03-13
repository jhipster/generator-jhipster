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

/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { exportApplication, exportApplications } = require('../../../jdl/exporters/applications/jhipster-application-exporter');

describe('JHipsterApplicationExporter', () => {
  describe('exportApplication', () => {
    context('when passing valid arguments', () => {
      context('when exporting an application to JSON', () => {
        let content;

        before(() => {
          exportApplication({
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
              creationTimestamp: 'new',
              databaseType: 'sql',
              devDatabaseType: 'h2Disk',
              enableHibernateCache: true,
              enableSwaggerCodegen: false,
              enableTranslation: false,
              jhiPrefix: 'jhi',
              jhipsterVersion: '4.9.0',
              languages: [],
              messageBroker: false,
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
              websocket: false,
              jwtSecretKey: '1234',
              withAdminUi: true,
            },
          });
          content = fs.readFileSync(path.join('.yo-rc.json'), { encoding: 'utf8' });
        });

        after(() => {
          fs.unlinkSync(path.join('.yo-rc.json'));
        });

        it('should write it', () => {
          expect(content).not.to.be.undefined;
        });
      });
      context('when the application has the creationTimestamp attribute', () => {
        let content;

        before(() => {
          fs.writeFileSync(
            '.yo-rc.json',
            JSON.stringify(
              {
                'generator-jhipster': {
                  jwtSecretKey: '1234',
                  creationTimestamp: 'old',
                },
                test: 1234,
              },
              null,
              2
            )
          );
          exportApplication({
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
              creationTimestamp: 'new',
              databaseType: 'sql',
              devDatabaseType: 'h2Disk',
              enableHibernateCache: true,
              enableSwaggerCodegen: false,
              enableTranslation: false,
              jhiPrefix: 'jhi',
              jhipsterVersion: '4.9.0',
              languages: [],
              messageBroker: false,
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
              websocket: false,
              jwtSecretKey: '1234',
              withAdminUi: true,
            },
          });
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
              languages: [],
              messageBroker: false,
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
              websocket: false,
              jwtSecretKey: '1234',
              creationTimestamp: 'old',
              withAdminUi: true,
            },
          });
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
      before(() => {
        exportApplications([
          {
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
              creationTimestamp: 'new',
              databaseType: 'sql',
              devDatabaseType: 'h2Disk',
              enableHibernateCache: true,
              enableSwaggerCodegen: false,
              enableTranslation: false,
              jhiPrefix: 'jhi',
              jhipsterVersion: '4.9.0',
              languages: [],
              messageBroker: false,
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
              websocket: false,
              jwtSecretKey: '1234',
              withAdminUi: true,
            },
          },

          {
            'generator-jhipster': {
              applicationType: 'monolith',
              authenticationType: 'jwt',
              baseName: 'titi',
              buildTool: 'maven',
              cacheProvider: 'ehcache',
              clientFramework: 'angularX',
              clientTheme: 'none',
              clientThemeVariant: '',
              clientPackageManager: 'npm',
              creationTimestamp: 'new',
              databaseType: 'sql',
              devDatabaseType: 'h2Disk',
              enableHibernateCache: true,
              enableSwaggerCodegen: false,
              enableTranslation: false,
              jhiPrefix: 'jhi',
              jhipsterVersion: '4.9.0',
              languages: [],
              messageBroker: false,
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
              websocket: false,
              jwtSecretKey: '1234',
              withAdminUi: true,
            },
          },
        ]);
      });
      after(() => {
        fs.unlinkSync(path.join('toto', '.yo-rc.json'));
        fs.rmdirSync('toto');
        fs.unlinkSync(path.join('titi', '.yo-rc.json'));
        fs.rmdirSync('titi');
      });

      it('should export the first application', () => {
        expect(() => {
          fs.readFileSync(path.join('toto', '.yo-rc.json'), { encoding: 'utf8' });
        }).not.to.throw();
      });
      it('should export the second application', () => {
        expect(() => {
          fs.readFileSync(path.join('titi', '.yo-rc.json'), { encoding: 'utf8' });
        }).not.to.throw();
      });
    });
  });
});
