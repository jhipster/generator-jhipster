/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

import { jestExpect } from 'mocha-expect-snapshot';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { exportApplication, exportApplications } from '../../../jdl/exporters/applications/jhipster-application-exporter.js';
import {
  applicationTypes,
  buildToolTypes,
  cacheTypes,
  authenticationTypes,
  clientFrameworkTypes,
  databaseTypes,
  serviceDiscoveryTypes,
  searchEngineTypes,
  websocketTypes,
  messageBrokerTypes,
} from '../../../jdl/jhipster/index.mjs';

const NO_MESSAGE_BROKER = messageBrokerTypes.NO;
const NO_WEBSOCKET = websocketTypes.NO;
const NO_SERVICE_DISCOVERY = serviceDiscoveryTypes.NO;
const NO_SEARCH_ENGINE = searchEngineTypes.NO;
const { MONOLITH } = applicationTypes;
const { MAVEN } = buildToolTypes;
const { EHCACHE } = cacheTypes;
const { JWT } = authenticationTypes;
const { ANGULAR } = clientFrameworkTypes;
const { SQL, H2_DISK, MYSQL } = databaseTypes;

describe('JHipsterApplicationExporter', () => {
  describe('exportApplication', () => {
    context('when passing valid arguments', () => {
      context('when exporting an application to JSON', () => {
        let content;

        before(() => {
          exportApplication({
            'generator-jhipster': {
              applicationType: MONOLITH,
              authenticationType: JWT,
              baseName: 'toto',
              buildTool: MAVEN,
              cacheProvider: EHCACHE,
              clientFramework: ANGULAR,
              clientTheme: 'none',
              clientThemeVariant: '',
              clientPackageManager: 'npm',
              creationTimestamp: 'new',
              databaseType: SQL,
              devDatabaseType: H2_DISK,
              enableHibernateCache: true,
              enableSwaggerCodegen: false,
              enableTranslation: false,
              jhiPrefix: 'jhi',
              jhipsterVersion: '4.9.0',
              languages: [],
              messageBroker: NO_MESSAGE_BROKER,
              packageFolder: 'com/mathieu/sample',
              packageName: 'com.mathieu.sample',
              prodDatabaseType: MYSQL,
              searchEngine: NO_SEARCH_ENGINE,
              serverPort: '8080',
              serviceDiscoveryType: NO_SERVICE_DISCOVERY,
              skipClient: false,
              skipServer: false,
              skipUserManagement: false,
              testFrameworks: [],
              websocket: NO_WEBSOCKET,
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
              applicationType: MONOLITH,
              authenticationType: JWT,
              baseName: 'toto',
              buildTool: MAVEN,
              cacheProvider: EHCACHE,
              clientFramework: ANGULAR,
              clientTheme: 'none',
              clientThemeVariant: '',
              clientPackageManager: 'npm',
              creationTimestamp: 'new',
              databaseType: SQL,
              devDatabaseType: H2_DISK,
              enableHibernateCache: true,
              enableSwaggerCodegen: false,
              enableTranslation: false,
              jhiPrefix: 'jhi',
              jhipsterVersion: '4.9.0',
              languages: [],
              messageBroker: NO_MESSAGE_BROKER,
              packageFolder: 'com/mathieu/sample',
              packageName: 'com.mathieu.sample',
              prodDatabaseType: MYSQL,
              searchEngine: NO_SEARCH_ENGINE,
              serverPort: '8080',
              serviceDiscoveryType: NO_SERVICE_DISCOVERY,
              skipClient: false,
              skipServer: false,
              skipUserManagement: false,
              testFrameworks: [],
              websocket: NO_WEBSOCKET,
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
          jestExpect(content).toMatchInlineSnapshot(`
Object {
  "generator-jhipster": Object {
    "applicationType": "monolith",
    "authenticationType": "jwt",
    "baseName": "toto",
    "buildTool": "maven",
    "cacheProvider": "ehcache",
    "clientFramework": "angular",
    "clientPackageManager": "npm",
    "clientTheme": "none",
    "clientThemeVariant": "",
    "creationTimestamp": "old",
    "databaseType": "sql",
    "devDatabaseType": "h2Disk",
    "enableHibernateCache": true,
    "enableSwaggerCodegen": false,
    "enableTranslation": false,
    "jhiPrefix": "jhi",
    "jhipsterVersion": "4.9.0",
    "jwtSecretKey": "1234",
    "languages": Array [],
    "messageBroker": "no",
    "packageFolder": "com/mathieu/sample",
    "packageName": "com.mathieu.sample",
    "prodDatabaseType": "mysql",
    "searchEngine": "no",
    "serverPort": "8080",
    "serviceDiscoveryType": "no",
    "skipClient": false,
    "skipServer": false,
    "skipUserManagement": false,
    "testFrameworks": Array [],
    "websocket": "no",
    "withAdminUi": true,
  },
  "test": 1234,
}
`);
        });
      });
    });
  });
  describe('exportApplications', () => {
    context('when passing invalid parameters', () => {
      context('such as undefined', () => {
        it('should fail', () => {
          expect(() => {
            // @ts-expect-error
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
              applicationType: MONOLITH,
              authenticationType: JWT,
              baseName: 'toto',
              buildTool: MAVEN,
              cacheProvider: EHCACHE,
              clientFramework: ANGULAR,
              clientTheme: 'none',
              clientThemeVariant: '',
              clientPackageManager: 'npm',
              creationTimestamp: 'new',
              databaseType: SQL,
              devDatabaseType: H2_DISK,
              enableHibernateCache: true,
              enableSwaggerCodegen: false,
              enableTranslation: false,
              jhiPrefix: 'jhi',
              jhipsterVersion: '4.9.0',
              languages: [],
              messageBroker: NO_MESSAGE_BROKER,
              packageFolder: 'com/mathieu/toto',
              packageName: 'com.mathieu.toto',
              prodDatabaseType: MYSQL,
              searchEngine: NO_SEARCH_ENGINE,
              serverPort: '8080',
              serviceDiscoveryType: NO_SERVICE_DISCOVERY,
              skipClient: false,
              skipServer: false,
              skipUserManagement: false,
              testFrameworks: [],
              websocket: NO_WEBSOCKET,
              jwtSecretKey: '1234',
              withAdminUi: true,
            },
          },

          {
            'generator-jhipster': {
              applicationType: 'monolith',
              authenticationType: JWT,
              baseName: 'titi',
              buildTool: MAVEN,
              cacheProvider: EHCACHE,
              clientFramework: ANGULAR,
              clientTheme: 'none',
              clientThemeVariant: '',
              clientPackageManager: 'npm',
              creationTimestamp: 'new',
              databaseType: SQL,
              devDatabaseType: H2_DISK,
              enableHibernateCache: true,
              enableSwaggerCodegen: false,
              enableTranslation: false,
              jhiPrefix: 'jhi',
              jhipsterVersion: '4.9.0',
              languages: [],
              messageBroker: NO_MESSAGE_BROKER,
              packageFolder: 'com/mathieu/titi',
              packageName: 'com.mathieu.titi',
              prodDatabaseType: MYSQL,
              searchEngine: NO_SEARCH_ENGINE,
              serverPort: '8080',
              serviceDiscoveryType: NO_SERVICE_DISCOVERY,
              skipClient: false,
              skipServer: false,
              skipUserManagement: false,
              testFrameworks: [],
              websocket: NO_WEBSOCKET,
              jwtSecretKey: '1234',
              withAdminUi: true,
            },
          },
        ]);
      });
      after(() => {
        fs.unlinkSync(path.join('toto', '.yo-rc.json'));
        fs.rmSync('toto', { recursive: true });
        fs.unlinkSync(path.join('titi', '.yo-rc.json'));
        fs.rmSync('titi', { recursive: true });
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
