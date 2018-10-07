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

const { expect } = require('chai');
const JDLUaaApplication = require('../../../lib/core/jdl_uaa_application');
const ApplicationOptions = require('../../../lib/core/jhipster/application_options');

describe('JDLUaaApplication', () => {
  describe('#new', () => {
    context('by default', () => {
      let jdlApplicationConfig = null;

      before(() => {
        const jdlApplication = new JDLUaaApplication({ config: { jhipsterVersion: '4.9.0' } });
        jdlApplicationConfig = jdlApplication.config;
      });

      it(`sets the base name to ${ApplicationOptions.baseName}`, () => {
        expect(jdlApplicationConfig.baseName).to.equal(ApplicationOptions.baseName);
      });
      it(`sets the build tool to ${ApplicationOptions.buildTool.maven}`, () => {
        expect(jdlApplicationConfig.buildTool).to.equal(ApplicationOptions.buildTool.maven);
      });
      it(`sets the application type to ${ApplicationOptions.applicationType.uaa}`, () => {
        expect(jdlApplicationConfig.applicationType).to.equal(ApplicationOptions.applicationType.uaa);
      });
      it(`sets the authentication type to ${ApplicationOptions.authenticationType.uaa}`, () => {
        expect(jdlApplicationConfig.authenticationType).to.equal(ApplicationOptions.authenticationType.uaa);
      });
      it(`sets the cache provider to ${ApplicationOptions.cacheProvider.hazelcast}`, () => {
        expect(jdlApplicationConfig.cacheProvider).to.equal(ApplicationOptions.cacheProvider.hazelcast);
      });
      it('unsets the client framework option', () => {
        expect(jdlApplicationConfig.clientFramework).to.be.undefined;
      });
      it('sets the server port to 9999', () => {
        expect(jdlApplicationConfig.serverPort).to.equal('9999');
      });
      it(`sets the service discovery type to ${ApplicationOptions.serviceDiscoveryType.eureka}`, () => {
        expect(jdlApplicationConfig.serviceDiscoveryType).to.equal(ApplicationOptions.serviceDiscoveryType.eureka);
      });
      it('unsets the skip server option', () => {
        expect(jdlApplicationConfig.skipServer).to.be.undefined;
      });
      it('unsets the skip user management option', () => {
        expect(jdlApplicationConfig.skipUserManagement).to.be.false;
      });
      it('sets the skip client option', () => {
        expect(jdlApplicationConfig.skipClient).to.be.true;
      });
    });
  });
});
