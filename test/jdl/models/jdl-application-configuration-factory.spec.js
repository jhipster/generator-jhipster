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

const { expect } = require('chai');
const JDLApplicationConfiguration = require('../../../jdl/models/jdl-application-configuration');
const StringJDLApplicationConfigurationOption = require('../../../jdl/models/string-jdl-application-configuration-option');
const IntegerJDLApplicationConfigurationOption = require('../../../jdl/models/integer-jdl-application-configuration-option');
const BooleanJDLApplicationConfigurationOption = require('../../../jdl/models/boolean-jdl-application-configuration-option');
const ListJDLApplicationConfigurationOption = require('../../../jdl/models/list-jdl-application-configuration-option');
const { OptionNames } = require('../../../jdl/jhipster/application-options');
const { createApplicationConfigurationFromObject } = require('../../../jdl/models/jdl-application-configuration-factory');

describe('JDLApplicationConfigurationFactory', () => {
  describe('createApplicationConfigurationFromObject', () => {
    context('when passing no configuration', () => {
      let createdConfiguration;
      let expectedConfiguration;

      before(() => {
        createdConfiguration = createApplicationConfigurationFromObject();
        expectedConfiguration = new JDLApplicationConfiguration();
      });

      it('should a configuration without option', () => {
        expect(createdConfiguration).to.deep.equal(expectedConfiguration);
      });
    });
    context('when passing a configuration', () => {
      context('containing a string option', () => {
        let createdConfiguration;
        let expectedConfiguration;

        before(() => {
          createdConfiguration = createApplicationConfigurationFromObject({
            [OptionNames.BASE_NAME]: 'application',
          });
          expectedConfiguration = new JDLApplicationConfiguration();
          expectedConfiguration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application'));
        });

        it('should create it', () => {
          expect(createdConfiguration).to.deep.equal(expectedConfiguration);
        });
      });
      context('containing a integer option', () => {
        let createdConfiguration;
        let expectedConfiguration;

        before(() => {
          createdConfiguration = createApplicationConfigurationFromObject({
            [OptionNames.SERVER_PORT]: 8042,
          });
          expectedConfiguration = new JDLApplicationConfiguration();
          expectedConfiguration.setOption(new IntegerJDLApplicationConfigurationOption(OptionNames.SERVER_PORT, 8042));
        });

        it('should create it', () => {
          expect(createdConfiguration).to.deep.equal(expectedConfiguration);
        });
      });
      context('containing a boolean option', () => {
        let createdConfiguration;
        let expectedConfiguration;

        before(() => {
          createdConfiguration = createApplicationConfigurationFromObject({
            [OptionNames.ENABLE_TRANSLATION]: true,
          });
          expectedConfiguration = new JDLApplicationConfiguration();
          expectedConfiguration.setOption(new BooleanJDLApplicationConfigurationOption(OptionNames.ENABLE_TRANSLATION, true));
        });

        it('should create it', () => {
          expect(createdConfiguration).to.deep.equal(expectedConfiguration);
        });
      });
      context('containing a list-based option', () => {
        let createdConfiguration;
        let expectedConfiguration;

        before(() => {
          createdConfiguration = createApplicationConfigurationFromObject({
            [OptionNames.TEST_FRAMEWORKS]: [],
          });
          expectedConfiguration = new JDLApplicationConfiguration();
          expectedConfiguration.setOption(new ListJDLApplicationConfigurationOption(OptionNames.TEST_FRAMEWORKS, []));
        });

        it('should create it', () => {
          expect(createdConfiguration).to.deep.equal(expectedConfiguration);
        });
      });
    });
  });
});
