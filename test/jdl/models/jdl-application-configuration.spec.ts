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

import { expect } from 'chai';
import JDLApplicationConfiguration from '../../../jdl/models/jdl-application-configuration.js';
import StringJDLApplicationConfigurationOption from '../../../jdl/models/string-jdl-application-configuration-option.js';
import { OptionNames } from '../../../jdl/jhipster/application-options.js';

describe('JDLApplicationConfiguration', () => {
  describe('hasOption', () => {
    context('when not passing an option name', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
      });

      it('should return false', () => {
        expect(configuration.hasOption()).to.be.false;
      });
    });
    context('when the configuration does not have the option', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
      });

      it('should return false', () => {
        expect(configuration.hasOption(OptionNames.BASE_NAME)).to.be.false;
      });
    });
    context('when the configuration has the option', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
        configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application'));
      });

      it('should return true', () => {
        expect(configuration.hasOption(OptionNames.BASE_NAME)).to.be.true;
      });
    });
  });
  describe('getOption', () => {
    context('when not passing an option name', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
      });

      it('should fail', () => {
        expect(() => configuration.getOption()).to.throw(/^An option name has to be passed to get the option\.$/);
      });
    });
    context('when the configuration does not have the option', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
      });

      it('should return undefined', () => {
        expect(configuration.getOption(OptionNames.BASE_NAME)).to.be.undefined;
      });
    });
    context('when the configuration has the option', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
        configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application'));
      });

      it('should return its value', () => {
        expect(configuration.getOption(OptionNames.BASE_NAME)).to.deep.equal(
          new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application')
        );
      });
    });
  });
  describe('setOption', () => {
    context('when not passing an option', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
      });

      it('should fail', () => {
        expect(() => configuration.setOption()).to.throw(/^An option has to be passed to set an option\.$/);
      });
    });
    context('when setting a new option', () => {
      let createdConfiguration;

      before(() => {
        createdConfiguration = new JDLApplicationConfiguration();
        createdConfiguration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application'));
      });

      it('should add it', () => {
        expect(createdConfiguration.hasOption(OptionNames.BASE_NAME)).to.be.true;
      });
    });
    context('when setting an already present option', () => {
      let createdConfiguration;

      before(() => {
        createdConfiguration = new JDLApplicationConfiguration();
        createdConfiguration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application'));
        createdConfiguration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application2'));
      });

      it('should replace its value', () => {
        expect(createdConfiguration.getOption(OptionNames.BASE_NAME).getValue()).to.equal('application2');
      });
    });
  });
  describe('forEachOption', () => {
    context('when not passing a function', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
      });

      it('should not do anything', () => {
        expect(() => configuration.forEachOption()).not.to.throw();
      });
    });
    context('when passing a function', () => {
      let result;

      before(() => {
        const configuration = new JDLApplicationConfiguration();
        configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'toto'));
        configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.JHI_PREFIX, 'prefix'));
        result = [];
        configuration.forEachOption(option => {
          result.push(`${option.name} is ${option.getValue()}`);
        });
        result = result.join(' and ');
      });

      it('should iterate over the options', () => {
        expect(result).to.equal('baseName is toto and jhiPrefix is prefix');
      });
    });
  });
  describe('toString', () => {
    context('when there is no option', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
      });

      context('when not passing an indentation', () => {
        it('should stringify it without indentation', () => {
          expect(configuration.toString()).to.equal('config {}');
        });
      });
      context('when passing an indentation', () => {
        it('should stringify it with indentation', () => {
          expect(configuration.toString(2)).to.equal('  config {}');
        });
      });
    });
    context('when there are options', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
        configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'toto'));
        configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.JHI_PREFIX, 'prefix'));
      });

      context('when not passing an indentation', () => {
        it('should stringify it without indentation', () => {
          expect(configuration.toString()).to.equal(`config {
baseName toto
jhiPrefix prefix
}`);
        });
      });
      context('when passing an indentation', () => {
        it('should stringify it with indentation', () => {
          expect(configuration.toString(2)).to.equal(`  config {
    baseName toto
    jhiPrefix prefix
  }`);
        });
      });
    });
    context('when the configuration has the dto suffix option', () => {
      context('without a value', () => {
        let configuration;

        before(() => {
          configuration = new JDLApplicationConfiguration();
          configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.DTO_SUFFIX, ''));
        });

        it('should not stringify it', () => {
          expect(configuration.toString()).not.to.include('dtoSuffix');
        });
      });
      context('with a value', () => {
        let configuration;

        before(() => {
          configuration = new JDLApplicationConfiguration();
          configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.DTO_SUFFIX, 'DTO'));
        });

        it('should stringify it', () => {
          expect(configuration.toString()).to.include('dtoSuffix DTO');
        });
      });
    });
    context('when the configuration has the entity suffix option', () => {
      context('without a value', () => {
        let configuration;

        before(() => {
          configuration = new JDLApplicationConfiguration();
          configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.ENTITY_SUFFIX, ''));
        });

        it('should not stringify it', () => {
          expect(configuration.toString()).not.to.include('entitySuffix');
        });
      });
      context('with a value', () => {
        let configuration;

        before(() => {
          configuration = new JDLApplicationConfiguration();
          configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.ENTITY_SUFFIX, 'suffix'));
        });

        it('should stringify it', () => {
          expect(configuration.toString()).to.include('entitySuffix suffix');
        });
      });
    });
    context('when the configuration has the client theme variant option', () => {
      context('without a value', () => {
        let configuration;

        before(() => {
          configuration = new JDLApplicationConfiguration();
          configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.CLIENT_THEME_VARIANT, ''));
        });

        it('should not stringify it', () => {
          expect(configuration.toString()).not.to.include('clientThemeVariant');
        });
      });
      context('with a value', () => {
        let configuration;

        before(() => {
          configuration = new JDLApplicationConfiguration();
          configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.CLIENT_THEME_VARIANT, 'primary'));
        });

        it('should stringify it', () => {
          expect(configuration.toString()).to.include('clientThemeVariant primary');
        });
      });
    });
    context('when the configuration has the package folder option', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
        configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.PACKAGE_FOLDER, 'aaa/bbb/ccc'));
      });

      it('should not stringify it', () => {
        expect(configuration.toString()).not.to.include('packageFolder');
      });
    });
  });
});
