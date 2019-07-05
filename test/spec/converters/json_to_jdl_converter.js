/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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

        it('writes a JDL file with the application', () => {
          expect(jdlFileContent).to.equal(`application {
  config {
    databaseType sql
    devDatabaseType h2Disk
    enableHibernateCache true
    enableSwaggerCodegen false
    enableTranslation false
    jhiPrefix jhi
    languages [en, fr]
    messageBroker false
    nativeLanguage en
    packageName com.mycompany.myapp
    packageFolder com/mycompany/myapp
    prodDatabaseType mysql
    searchEngine false
    serviceDiscoveryType eureka
    skipClient true
    testFrameworks []
    websocket false
    promptValues [object Object]
    jhipsterVersion 6.0.1
    applicationType microservice
    baseName truc
    serverPort 8081
    authenticationType jwt
    cacheProvider hazelcast
    buildTool maven
    jwtSecretKey HIDDEN
    entitySuffix 
    dtoSuffix DTO
    otherModules 
    clientPackageManager npm
    skipUserManagement true
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

        it('exports apps & entities', () => {
          expect(jdlFileContent).to.equal(`application {
  config {
    databaseType sql
    devDatabaseType h2Disk
    enableHibernateCache true
    enableSwaggerCodegen false
    enableTranslation false
    jhiPrefix jhi
    languages [en, fr]
    messageBroker false
    nativeLanguage en
    packageName com.mycompany.myapp
    packageFolder com/mycompany/myapp
    prodDatabaseType mysql
    searchEngine false
    serviceDiscoveryType eureka
    skipClient true
    testFrameworks []
    websocket false
    promptValues [object Object]
    jhipsterVersion 6.0.1
    applicationType microservice
    baseName truc
    serverPort 8081
    authenticationType jwt
    cacheProvider hazelcast
    buildTool maven
    jwtSecretKey HIDDEN
    entitySuffix 
    dtoSuffix DTO
    otherModules 
    clientPackageManager npm
    skipUserManagement true
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

        it('exports each app', () => {
          expect(jdlFileContent).to.equal(`application {
  config {
    databaseType sql
    devDatabaseType h2Disk
    enableHibernateCache true
    enableSwaggerCodegen false
    enableTranslation false
    jhiPrefix jhi
    languages [en, fr]
    messageBroker false
    nativeLanguage en
    packageName com.mycompany.app1
    packageFolder com/mycompany/app1
    prodDatabaseType mysql
    searchEngine false
    serviceDiscoveryType eureka
    skipClient true
    testFrameworks []
    websocket false
    promptValues [object Object]
    jhipsterVersion 6.0.1
    applicationType microservice
    baseName app1
    serverPort 8081
    authenticationType jwt
    cacheProvider hazelcast
    buildTool maven
    jwtSecretKey HIDDEN
    entitySuffix 
    dtoSuffix DTO
    otherModules 
    clientPackageManager npm
    skipUserManagement true
  }

  entities Region
}
application {
  config {
    databaseType sql
    devDatabaseType h2Disk
    enableHibernateCache true
    enableSwaggerCodegen false
    enableTranslation false
    jhiPrefix jhi
    languages [en, fr]
    messageBroker false
    nativeLanguage en
    packageName com.mycompany.app2
    packageFolder com/mycompany/app2
    prodDatabaseType mysql
    searchEngine false
    serviceDiscoveryType eureka
    skipClient true
    testFrameworks []
    websocket false
    promptValues [object Object]
    jhipsterVersion 6.0.1
    applicationType microservice
    baseName app2
    serverPort 8081
    authenticationType jwt
    cacheProvider hazelcast
    buildTool maven
    jwtSecretKey HIDDEN
    entitySuffix 
    dtoSuffix DTO
    otherModules 
    clientPackageManager npm
    skipUserManagement true
  }

  entities Country, Location
}
application {
  config {
    databaseType sql
    devDatabaseType h2Disk
    enableHibernateCache true
    enableSwaggerCodegen false
    enableTranslation false
    jhiPrefix jhi
    languages [en, fr]
    messageBroker false
    nativeLanguage en
    packageName com.mycompany.app3
    packageFolder com/mycompany/app3
    prodDatabaseType mysql
    searchEngine false
    serviceDiscoveryType eureka
    skipClient true
    testFrameworks []
    websocket false
    promptValues [object Object]
    jhipsterVersion 6.0.1
    applicationType microservice
    baseName app3
    serverPort 8081
    authenticationType jwt
    cacheProvider hazelcast
    buildTool maven
    jwtSecretKey HIDDEN
    entitySuffix 
    dtoSuffix DTO
    otherModules 
    clientPackageManager npm
    skipUserManagement true
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
  });
});
