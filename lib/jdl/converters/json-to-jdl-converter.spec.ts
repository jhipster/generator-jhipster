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
import fs, { readFileSync } from 'node:fs';
import path from 'node:path';

import { expect } from 'chai';

import { getDefaultRuntime } from '../../jdl-config/jhipster-jdl-config.ts';
import { basicHelpers as helpers, createJHipsterConfigFiles } from '../../testing/index.ts';
import { getTestFile } from '../core/__test-support__/index.ts';

import { convertSingleContentToJDL, convertToJDL } from './json-to-jdl-converter.ts';

describe('jdl - JSONToJDLConverter', () => {
  const runtime = getDefaultRuntime();

  beforeEach(async () => {
    await helpers.prepareTemporaryDir();
  });

  describe('convertToJDL', () => {
    describe('when there is a yo-rc file in the passed directory', () => {
      let jdlFileContent: string;

      describe('without entities', () => {
        beforeEach(async () => {
          await helpers
            .prepareTemporaryDir()
            .withFiles(
              createJHipsterConfigFiles({
                jhipsterVersion: '6.0.1',
                applicationType: 'microservice',
                baseName: 'truc',
                blueprints: [{ name: 'generator-jhipster-vuejs' }, { name: 'generator-jhipster-dotnetcore' }],
                packageName: 'com.mycompany.myapp',
                packageFolder: 'com/mycompany/myapp',
                serverPort: '8081',
                authenticationType: 'jwt',
                cacheProvider: 'hazelcast',
                enableHibernateCache: true,
                websocket: 'no',
                databaseType: 'sql',
                devDatabaseType: 'h2Disk',
                prodDatabaseType: 'mysql',
                searchEngine: 'no',
                messageBroker: 'no',
                serviceDiscoveryType: 'eureka',
                buildTool: 'maven',
                enableSwaggerCodegen: false,
                jwtSecretKey: 'HIDDEN',
                testFrameworks: [],
                jhiPrefix: 'jhi',
                entitySuffix: '',
                dtoSuffix: 'DTO',
                enableTranslation: false,
                clientPackageManager: 'npm',
                skipClient: true,
                nativeLanguage: 'en',
                skipUserManagement: true,
              }),
            )
            .commitFiles();
          convertToJDL(runtime);
          jdlFileContent = fs.readFileSync('app.jdl', 'utf-8');
        });

        it('should write a JDL file with the application', () => {
          jestExpect(jdlFileContent).toMatchInlineSnapshot(`
            "application {
              config {
                applicationType microservice
                authenticationType jwt
                baseName truc
                blueprints [generator-jhipster-vuejs, generator-jhipster-dotnetcore]
                buildTool maven
                cacheProvider hazelcast
                clientPackageManager npm
                databaseType sql
                devDatabaseType h2Disk
                dtoSuffix DTO
                enableHibernateCache true
                enableSwaggerCodegen false
                enableTranslation false
                jhiPrefix jhi
                jhipsterVersion "6.0.1"
                jwtSecretKey "HIDDEN"
                messageBroker no
                nativeLanguage en
                packageName com.mycompany.myapp
                prodDatabaseType mysql
                searchEngine no
                serverPort 8081
                serviceDiscoveryType eureka
                skipClient true
                skipUserManagement true
                testFrameworks []
                websocket no
              }
            }
            "
          `);
        });
      });

      describe('with entities', () => {
        beforeEach(() => {
          const dir = getTestFile('json_to_jdl_converter', 'app_with_entities');
          convertToJDL(runtime, dir);
          jdlFileContent = fs.readFileSync(path.join(dir, 'app.jdl'), 'utf-8');
        });

        it('should export apps & entities', () => {
          jestExpect(jdlFileContent).toMatchInlineSnapshot(`
"application {
  config {
    applicationType microservice
    authenticationType jwt
    baseName truc
    buildTool maven
    cacheProvider hazelcast
    clientPackageManager npm
    databaseType sql
    devDatabaseType h2Disk
    dtoSuffix DTO
    enableHibernateCache true
    enableSwaggerCodegen false
    enableTranslation false
    jhiPrefix jhi
    jhipsterVersion "6.0.1"
    jwtSecretKey "HIDDEN"
    messageBroker no
    nativeLanguage en
    packageName com.mycompany.myapp
    prodDatabaseType mysql
    searchEngine no
    serverPort 8081
    serviceDiscoveryType eureka
    skipClient true
    skipUserManagement true
    testFrameworks []
    websocket no
  }

  entities Country, Department, Employee, Job, JobHistory, Location, Region, Task
}

entity Country (country) {
  countryName String
}
entity Department (department) {
  departmentName String
}
entity Employee (employee) {
  firstName String
  lastName String
  email String
  phoneNumber String
  hireDate ZonedDateTime
  salary Long
  commissionPct Long
}
entity Job (job) {
  jobTitle String
  minSalary Long
  maxSalary Long
}
entity JobHistory (job_history) {
  startDate ZonedDateTime
  endDate ZonedDateTime
}
entity Location (location) {
  streetAddress String
  postalCode String
  city String
  stateProvince String
}
entity Region (region) {
  regionName String
}
entity Task (task) {
  title String
  description String
}

relationship OneToOne {
  Country{region required} to Region
  Department{location required} to Location
  JobHistory{department required} to Department
  JobHistory{job required} to Job
  JobHistory{employee required} to Employee
  Location{country required} to Country
}
relationship OneToMany {
  Department{employee} to Employee
  Employee{job} to Job
}
relationship ManyToOne {
  Employee{department} to Department{employee}
  Employee{manager} to Employee
  Job{employee} to Employee{job}
}
relationship ManyToMany {
  Job{task} to Task{job}
  Task{job} to Job{task}
}

noFluentMethod Country, Department, Employee, Job, JobHistory, Location, Region, Task
paginate Country with pager
"
`);
        });
      });
    });
    describe('when there is no yo-rc file in the passed directory', () => {
      describe('with no JHipster app', () => {
        it('does not fail', () => {
          expect(() => convertToJDL(runtime)).not.to.throw();
        });
      });
      describe('with several JHipster apps', () => {
        let rootDir;
        let jdlFilename;
        let jdlFileContent: string;

        beforeEach(() => {
          rootDir = getTestFile('json_to_jdl_converter', 'multi_apps');
          jdlFilename = 'app.jdl';
          convertToJDL(runtime, rootDir);
          jdlFileContent = fs.readFileSync(path.join(rootDir, jdlFilename), 'utf-8');
        });

        it('should export each app', () => {
          jestExpect(jdlFileContent).toMatchInlineSnapshot(`
"application {
  config {
    applicationType microservice
    authenticationType jwt
    baseName app1
    buildTool maven
    cacheProvider hazelcast
    clientPackageManager npm
    databaseType sql
    devDatabaseType h2Disk
    dtoSuffix DTO
    enableHibernateCache true
    enableSwaggerCodegen false
    enableTranslation false
    jhiPrefix jhi
    jhipsterVersion "6.0.1"
    jwtSecretKey "HIDDEN"
    messageBroker no
    nativeLanguage en
    packageName com.mycompany.app1
    prodDatabaseType mysql
    searchEngine no
    serverPort 8081
    serviceDiscoveryType eureka
    skipClient true
    skipUserManagement true
    testFrameworks []
    websocket no
  }

  entities Region
}
application {
  config {
    applicationType microservice
    authenticationType jwt
    baseName app2
    buildTool maven
    cacheProvider hazelcast
    clientPackageManager npm
    databaseType sql
    devDatabaseType h2Disk
    dtoSuffix DTO
    enableHibernateCache true
    enableSwaggerCodegen false
    enableTranslation false
    jhiPrefix jhi
    jhipsterVersion "6.0.1"
    jwtSecretKey "HIDDEN"
    messageBroker no
    nativeLanguage en
    packageName com.mycompany.app2
    prodDatabaseType mysql
    searchEngine no
    serverPort 8081
    serviceDiscoveryType eureka
    skipClient true
    skipUserManagement true
    testFrameworks []
    websocket no
  }

  entities Country, Location
}
application {
  config {
    applicationType microservice
    authenticationType jwt
    baseName app3
    buildTool maven
    cacheProvider hazelcast
    clientPackageManager npm
    databaseType sql
    devDatabaseType h2Disk
    dtoSuffix DTO
    enableHibernateCache true
    enableSwaggerCodegen false
    enableTranslation false
    jhiPrefix jhi
    jhipsterVersion "6.0.1"
    jwtSecretKey "HIDDEN"
    messageBroker no
    nativeLanguage en
    packageName com.mycompany.app3
    prodDatabaseType mysql
    searchEngine no
    serverPort 8081
    serviceDiscoveryType eureka
    skipClient true
    skipUserManagement true
    testFrameworks []
    websocket no
  }
}

entity Region (region) {
  regionName String
}
entity Country (country) {
  countryName String
}
entity Location (location) {
  streetAddress String
  postalCode String
  city String
  stateProvince String
}

relationship OneToOne {
  Location{country required} to Country
}

noFluentMethod Region, Country, Location
"
`);
        });
      });
    });
    describe('when passing an output file', () => {
      let file: string;

      beforeEach(async () => {
        file = 'exported.jdl';
        await helpers
          .prepareTemporaryDir()
          .withFiles(createJHipsterConfigFiles({ baseName: 'jhipster' }))
          .commitFiles();
        convertToJDL(runtime, '.', file);
      });

      it('should output it to the output file', () => {
        jestExpect(readFileSync(file, 'utf-8')).toMatchInlineSnapshot(`
"application {
  config {
    baseName jhipster
  }
}
"
`);
      });
    });
  });
  describe('convertSingleContentToJDL', () => {
    describe('with microservices attribute', () => {
      let jdl: string;
      beforeEach(() => {
        jdl = convertSingleContentToJDL(
          {
            'generator-jhipster': {
              baseName: 'x',
              microfrontends: [
                {
                  baseName: 'foo',
                },
                {
                  baseName: 'bar',
                },
              ],
            },
          },
          runtime,
        );
      });

      it('should write a JDL file with the application', () => {
        jestExpect(jdl).toMatch(/microfrontends \[foo, bar\]/);
      });
    });
    describe('with nullish attributes', () => {
      it('should not fail', () => {
        convertSingleContentToJDL(
          {
            'generator-jhipster': {
              baseName: 'x',
            },
          },
          runtime,
        );
      });
    });
  });
});
