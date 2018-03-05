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

/* eslint-disable no-unused-expressions */
const expect = require('chai').expect;
const JDLApplication = require('../../../lib/core/jdl_application');

describe('JDLApplication', () => {
  describe('::new', () => {
    let jdlApplicationConfig = null;

    before(() => {
      const jdlApplication = new JDLApplication({ config: { jhipsterVersion: '4.9.0' } });
      jdlApplicationConfig = jdlApplication.config;
    });

    context('without specifying special options', () => {
      it('uses default values', () => {
        expect(jdlApplicationConfig.jhipsterVersion).to.eq('4.9.0');
        expect(jdlApplicationConfig.baseName).to.eq('jhipster');
        expect(jdlApplicationConfig.packageName).to.eq('com.mycompany.myapp');
        expect(jdlApplicationConfig.packageFolder).to.eq('com/mycompany/myapp');
        expect(jdlApplicationConfig.authenticationType).to.eq('jwt');
        expect(jdlApplicationConfig.hibernateCache).to.eq('no');
        expect(jdlApplicationConfig.clusteredHttpSession).to.eq('no');
        expect(jdlApplicationConfig.websocket).to.eq(false);
        expect(jdlApplicationConfig.databaseType).to.eq('sql');
        expect(jdlApplicationConfig.devDatabaseType).to.eq('h2Memory');
        expect(jdlApplicationConfig.prodDatabaseType).to.eq('mysql');
        expect(jdlApplicationConfig.useCompass).to.eq(false);
        expect(jdlApplicationConfig.buildTool).to.eq('maven');
        expect(jdlApplicationConfig.searchEngine).to.eq(false);
        expect(jdlApplicationConfig.enableTranslation).to.eq(true);
        expect(jdlApplicationConfig.applicationType).to.eq('monolith');
        expect(jdlApplicationConfig.testFrameworks.size()).to.eq(0);
        expect(jdlApplicationConfig.languages.has('en')).to.be.true;
        expect(jdlApplicationConfig.serverPort).to.eq(8080);
        expect(jdlApplicationConfig.enableSocialSignIn).to.eq(false);
        expect(jdlApplicationConfig.useSass).to.eq(false);
        expect(jdlApplicationConfig.jhiPrefix).to.eq('jhi');
        expect(jdlApplicationConfig.messageBroker).to.eq(false);
        expect(jdlApplicationConfig.serviceDiscoveryType).to.eq(false);
        expect(jdlApplicationConfig.clientPackageManager).to.eq('yarn');
        expect(jdlApplicationConfig.clientFramework).to.eq('angularX');
        expect(jdlApplicationConfig.nativeLanguage).to.eq('en');
        expect(jdlApplicationConfig.frontEndBuilder).to.be.null;
        expect(jdlApplicationConfig.skipUserManagement).to.eq(false);
        expect(jdlApplicationConfig.skipClient).to.eq(false);
        expect(jdlApplicationConfig.skipServer).to.eq(false);
        expect(jdlApplicationConfig.rememberMeKey).to.be.undefined;
        expect(jdlApplicationConfig.jwtSecretKey).not.to.be.undefined;
        expect(jdlApplicationConfig.path).to.equal('.');
      });
    });
    context('when choosing session as authentication type', () => {
      before(() => {
        jdlApplicationConfig = new JDLApplication(
          { config: { jhipsterVersion: '4.9.0', authenticationType: 'session' } }
        ).config;
      });
      it('sets the rememberMeKey value', () => {
        expect(jdlApplicationConfig.rememberMeKey).not.to.be.undefined;
        expect(jdlApplicationConfig.jwtSecretKey).to.be.undefined;
      });
    });
    context('when choosing jwt as authentication type', () => {
      before(() => {
        jdlApplicationConfig = new JDLApplication(
          { config: { jhipsterVersion: '4.9.0', authenticationType: 'jwt' } }
        ).config;
      });
      it('sets the jwtSecretKey value', () => {
        expect(jdlApplicationConfig.rememberMeKey).to.be.undefined;
        expect(jdlApplicationConfig.jwtSecretKey).not.to.be.undefined;
      });
    });
    context('when choosing microservice as app type', () => {
      before(() => {
        jdlApplicationConfig = new JDLApplication(
          { config: { jhipsterVersion: '4.9.0', applicationType: 'microservice' } }
        ).config;
      });
      it('sets the jwtSecretKey value', () => {
        expect(jdlApplicationConfig.rememberMeKey).to.be.undefined;
        expect(jdlApplicationConfig.jwtSecretKey).not.to.be.undefined;
      });
    });
  });
  describe('#toString', () => {
    let jdlApplication = null;

    before(() => {
      jdlApplication = new JDLApplication({ config: { jhipsterVersion: '4.9.0', path: '../../' } });
      delete jdlApplication.config.jwtSecretKey;
    });

    it('stringifies the application object', () => {
      expect(jdlApplication.toString()).to.eq(`application {
  config {
    baseName jhipster
    path ../../
    packageName com.mycompany.myapp
    packageFolder com/mycompany/myapp
    authenticationType jwt
    hibernateCache no
    clusteredHttpSession no
    websocket false
    databaseType sql
    devDatabaseType h2Memory
    prodDatabaseType mysql
    useCompass false
    buildTool maven
    searchEngine false
    enableTranslation true
    applicationType monolith
    testFrameworks
    languages en
    serverPort 8080
    enableSocialSignIn false
    enableSwaggerCodegen false
    useSass false
    jhiPrefix jhi
    messageBroker false
    serviceDiscoveryType false
    clientPackageManager yarn
    clientFramework angularX
    nativeLanguage en
    frontEndBuilder
    skipUserManagement false
    skipClient false
    skipServer false
    jhipsterVersion 4.9.0
  }
}`);
    });
  });
  describe('::isValid', () => {
    context('when checking the validity of an invalid object', () => {
      context('because it is nil', () => {
        it('returns false', () => {
          expect(JDLApplication.isValid()).to.be.false;
        });
      });
      context('when not having a config attribute', () => {
        it('returns false', () => {
          expect(JDLApplication.isValid({})).to.be.false;
        });
      });

      const PROPERTIES = [
        'baseName',
        'packageName',
        'packageFolder',
        'authenticationType',
        'databaseType',
        'devDatabaseType',
        'prodDatabaseType',
        'buildTool',
        'applicationType',
        'clientFramework',
        'hibernateCache',
        'nativeLanguage'
      ];
      const basicApplicationConfig = new JDLApplication({ jhipsterVersion: '4.9.0' });

      PROPERTIES.forEach((property) => {
        context(`when not having the ${property} property`, () => {
          const currentPropertyValue = basicApplicationConfig.config[property];
          before(() => {
            delete basicApplicationConfig.config[property];
          });
          after(() => {
            basicApplicationConfig.config[property] = currentPropertyValue;
          });

          it('returns false', () => {
            expect(JDLApplication.isValid(basicApplicationConfig)).to.be.false;
          });
        });
      });
    });
  });
});
