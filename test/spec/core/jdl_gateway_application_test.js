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

/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const ApplicationOptions = require('../../../lib/core/jhipster/application_options');
const JDLGatewayApplication = require('../../../lib/core/jdl_gateway_application');

describe('JDLGatewayApplication', () => {
  describe('::new', () => {
    context('by default', () => {
      let jdlApplicationConfig = null;

      before(() => {
        const jdlApplication = new JDLGatewayApplication({ config: { jhipsterVersion: '4.9.0' } });
        jdlApplicationConfig = jdlApplication.config;
      });

      it(`sets the base name to ${ApplicationOptions.baseName}`, () => {
        expect(jdlApplicationConfig.baseName).to.equal(ApplicationOptions.baseName);
      });
      it(`sets the build tool to ${ApplicationOptions.buildTool.maven}`, () => {
        expect(jdlApplicationConfig.buildTool).to.equal(ApplicationOptions.buildTool.maven);
      });
      it(`sets the skip user management flag to ${ApplicationOptions.skipUserManagement}`, () => {
        expect(jdlApplicationConfig.skipUserManagement).to.equal(ApplicationOptions.skipUserManagement);
      });
      it(`sets the application type to ${ApplicationOptions.applicationType.gateway}`, () => {
        expect(jdlApplicationConfig.applicationType).to.equal(ApplicationOptions.applicationType.gateway);
      });
      it(`sets the authentication type to ${ApplicationOptions.authenticationType.jwt}`, () => {
        expect(jdlApplicationConfig.authenticationType).to.equal(ApplicationOptions.authenticationType.jwt);
      });
      it(`sets the cache provider to ${ApplicationOptions.cacheProvider.ehcache}`, () => {
        expect(jdlApplicationConfig.cacheProvider).to.equal(ApplicationOptions.cacheProvider.ehcache);
      });
      it(`sets the server port to ${ApplicationOptions.serverPort}`, () => {
        expect(jdlApplicationConfig.serverPort).to.equal(ApplicationOptions.serverPort);
      });
      it(`sets the client framework to ${ApplicationOptions.clientFramework.angularX}`, () => {
        expect(jdlApplicationConfig.clientFramework).to.equal(ApplicationOptions.clientFramework.angularX);
      });
      it(`sets the service discovery type to ${ApplicationOptions.serviceDiscoveryType.eureka}`, () => {
        expect(jdlApplicationConfig.serviceDiscoveryType).to.equal(ApplicationOptions.serviceDiscoveryType.eureka);
      });
      it('uses sass', () => {
        expect(jdlApplicationConfig.useSass).to.be.true;
      });
      it(`sets the clientTheme to ${ApplicationOptions.clientTheme}`, () => {
        expect(jdlApplicationConfig.clientTheme).to.equal(ApplicationOptions.clientTheme);
      });
      it(`sets the clientThemeVariant to ${ApplicationOptions.clientThemeVariant.none}`, () => {
        expect(jdlApplicationConfig.clientThemeVariant).to.equal(ApplicationOptions.clientThemeVariant.none);
      });
    });
    context(`when the authentication type is ${ApplicationOptions.authenticationType.oauth2}`, () => {
      let jdlApplicationConfig = null;

      before(() => {
        const jdlApplication = new JDLGatewayApplication({
          config: { authenticationType: ApplicationOptions.authenticationType.oauth2, jhipsterVersion: '4.9.0' }
        });
        jdlApplicationConfig = jdlApplication.config;
      });

      it('sets the skipUserManagement flag to true', () => {
        expect(jdlApplicationConfig.skipUserManagement).to.be.true;
      });
    });
    context(`when the clientTheme isn't ${ApplicationOptions.clientTheme} and the clientThemeVariant isn't set`, () => {
      let jdlApplicationConfig;

      before(() => {
        const jdlApplication = new JDLGatewayApplication({
          config: { clientTheme: 'yeti', jhipsterVersion: '4.9.0' }
        });
        jdlApplicationConfig = jdlApplication.config;
      });

      it(`sets it to ${ApplicationOptions.clientThemeVariant.default}`, () => {
        expect(jdlApplicationConfig.clientThemeVariant).to.equal(ApplicationOptions.clientThemeVariant.default);
      });
    });
  });
});
