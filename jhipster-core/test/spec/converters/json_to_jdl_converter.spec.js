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

const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const { convertToJDL } = require('../../../lib/converters/json_to_jdl_converter');

describe('JSONToJDLConverter', () => {
  describe('convertToJDL', () => {
    context('when there is a yo-rc file in the passed directory', () => {
      let dir;
      let jdlFilename;
      let jdlFileContent;

      context('without entities', () => {
        before(() => {
          dir = path.join('test', 'test_files', 'json_to_jdl_converter', 'only_app');
          jdlFilename = 'app.jdl';
          convertToJDL(dir);
          jdlFileContent = fs.readFileSync(path.join(dir, jdlFilename), 'utf-8');
        });
        after(() => {
          fs.unlinkSync(path.join(dir, jdlFilename));
        });

        it('should write a JDL file with the application', () => {
          expect(jdlFileContent).to.equal(`application {
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
    languages [en, fr]
    messageBroker false
    nativeLanguage en
    otherModules []
    packageName com.mycompany.myapp
    prodDatabaseType mysql
    searchEngine false
    serverPort 8081
    serviceDiscoveryType eureka
    skipClient true
    skipUserManagement true
    testFrameworks []
    websocket false
  }
}

`);
        });
      });
      context('with entities', () => {
        before(() => {
          dir = path.join('test', 'test_files', 'json_to_jdl_converter', 'app_with_entities');
          jdlFilename = 'app.jdl';
          convertToJDL(dir);
          jdlFileContent = fs.readFileSync(path.join(dir, jdlFilename), 'utf-8');
        });
        after(() => {
          fs.unlinkSync(path.join(dir, jdlFilename));
        });

        it('should export apps & entities', () => {
          expect(jdlFileContent).to.equal(`application {
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
    languages [en, fr]
    messageBroker false
    nativeLanguage en
    otherModules []
    packageName com.mycompany.myapp
    prodDatabaseType mysql
    searchEngine false
    serverPort 8081
    serviceDiscoveryType eureka
    skipClient true
    skipUserManagement true
    testFrameworks []
    websocket false
  }

  entities Country, Department, Employee, Job, JobHistory, Location, Region, Task
}

entity Country {
  countryName String
}
entity Department {
  departmentName String
}
entity Employee {
  firstName String,
  lastName String,
  email String,
  phoneNumber String,
  hireDate ZonedDateTime,
  salary Long,
  commissionPct Long
}
entity Job {
  jobTitle String,
  minSalary Long,
  maxSalary Long
}
entity JobHistory {
  startDate ZonedDateTime,
  endDate ZonedDateTime
}
entity Location {
  streetAddress String,
  postalCode String,
  city String,
  stateProvince String
}
entity Region {
  regionName String
}
entity Task {
  title String,
  description String
}
relationship OneToOne {
  Country{region required} to Region,
  Department{location required} to Location,
  JobHistory{department required} to Department,
  JobHistory{job required} to Job,
  JobHistory{employee required} to Employee,
  Location{country required} to Country
}
relationship OneToMany {
  Department{employee} to Employee{department},
  Employee{job} to Job{employee}
}
relationship ManyToOne {
  Employee{manager} to Employee
}
relationship ManyToMany {
  Job{task} to Task{job}
}

noFluentMethod Country, Department, Employee, Job, JobHistory, Location, Region, Task
paginate Country with pager
`);
        });
      });
    });
    context('when there is no yo-rc file in the passed directory', () => {
      context('with no JHipster app', () => {
        let dir;

        before(() => {
          dir = path.join('test', 'test_files', 'json_to_jdl_converter', 'empty_dir');
          fs.mkdirSync(dir);
        });
        after(() => {
          fs.rmdirSync(dir);
        });

        it('does not fail', () => {
          expect(() => convertToJDL(dir)).not.to.throw();
        });
      });
      context('with several JHipster apps', () => {
        let rootDir;
        let jdlFilename;
        let jdlFileContent;

        beforeEach(() => {
          rootDir = path.join('test', 'test_files', 'json_to_jdl_converter', 'multi_apps');
          jdlFilename = 'app.jdl';
          convertToJDL(rootDir);
          jdlFileContent = fs.readFileSync(path.join(rootDir, jdlFilename), 'utf-8');
        });
        afterEach(() => {
          fs.unlinkSync(path.join(rootDir, jdlFilename));
        });

        it('should export each app', () => {
          expect(jdlFileContent).to.equal(`application {
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
    languages [en, fr]
    messageBroker false
    nativeLanguage en
    otherModules []
    packageName com.mycompany.app1
    prodDatabaseType mysql
    searchEngine false
    serverPort 8081
    serviceDiscoveryType eureka
    skipClient true
    skipUserManagement true
    testFrameworks []
    websocket false
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
    languages [en, fr]
    messageBroker false
    nativeLanguage en
    otherModules []
    packageName com.mycompany.app2
    prodDatabaseType mysql
    searchEngine false
    serverPort 8081
    serviceDiscoveryType eureka
    skipClient true
    skipUserManagement true
    testFrameworks []
    websocket false
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
    languages [en, fr]
    messageBroker false
    nativeLanguage en
    otherModules []
    packageName com.mycompany.app3
    prodDatabaseType mysql
    searchEngine false
    serverPort 8081
    serviceDiscoveryType eureka
    skipClient true
    skipUserManagement true
    testFrameworks []
    websocket false
  }
}

entity Region {
  regionName String
}
entity Country {
  countryName String
}
entity Location {
  streetAddress String,
  postalCode String,
  city String,
  stateProvince String
}
relationship OneToOne {
  Location{country required} to Country
}

noFluentMethod Region, Country, Location
`);
        });
      });
    });
    context('when passing an output file', () => {
      let dir;
      let output;

      before(() => {
        dir = path.join('test', 'test_files', 'json_to_jdl_converter', 'only_app');
        output = 'exported.jdl';
        convertToJDL(dir, output);
      });
      after(() => {
        fs.unlinkSync(path.join(dir, output));
      });

      it('should output it to the output file', () => {
        expect(fs.readFileSync(path.join(dir, output), 'utf-8')).not.to.be.null;
      });
    });
  });
});
