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

import { before, describe, it } from 'esmocha';

import { expect } from 'chai';

import applicationOptions from '../../../jhipster/application-options.ts';
import JDLApplicationConfiguration from '../models/jdl-application-configuration.ts';
import StringJDLApplicationConfigurationOption from '../models/string-jdl-application-configuration-option.ts';

const { OptionNames } = applicationOptions;

describe('jdl - JDLApplicationConfiguration', () => {
  describe('hasOption', () => {
    describe('when not passing an option name', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
      });

      it('should return false', () => {
        expect(configuration.hasOption()).to.be.false;
      });
    });
    describe('when the configuration does not have the option', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
      });

      it('should return false', () => {
        expect(configuration.hasOption(OptionNames.BASE_NAME)).to.be.false;
      });
    });
    describe('when the configuration has the option', () => {
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
    describe('when not passing an option name', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
      });

      it('should fail', () => {
        expect(() => configuration.getOption()).to.throw(/^An option name has to be passed to get the option\.$/);
      });
    });
    describe('when the configuration does not have the option', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
      });

      it('should return undefined', () => {
        expect(configuration.getOption(OptionNames.BASE_NAME)).to.be.undefined;
      });
    });
    describe('when the configuration has the option', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
        configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application'));
      });

      it('should return its value', () => {
        expect(configuration.getOption(OptionNames.BASE_NAME)).to.deep.equal(
          new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application'),
        );
      });
    });
  });
  describe('setOption', () => {
    describe('when not passing an option', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
      });

      it('should fail', () => {
        expect(() => configuration.setOption()).to.throw(/^An option has to be passed to set an option\.$/);
      });
    });
    describe('when setting a new option', () => {
      let createdConfiguration;

      before(() => {
        createdConfiguration = new JDLApplicationConfiguration();
        createdConfiguration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'application'));
      });

      it('should add it', () => {
        expect(createdConfiguration.hasOption(OptionNames.BASE_NAME)).to.be.true;
      });
    });
    describe('when setting an already present option', () => {
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
    describe('when not passing a function', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
      });

      it('should not do anything', () => {
        expect(() => configuration.forEachOption()).not.to.throw();
      });
    });
    describe('when passing a function', () => {
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
    describe('when there is no option', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
      });

      describe('when not passing an indentation', () => {
        it('should stringify it without indentation', () => {
          expect(configuration.toString()).to.equal('config {}');
        });
      });
      describe('when passing an indentation', () => {
        it('should stringify it with indentation', () => {
          expect(configuration.toString(2)).to.equal('  config {}');
        });
      });
    });
    describe('when there are options', () => {
      let configuration;

      before(() => {
        configuration = new JDLApplicationConfiguration();
        configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.BASE_NAME, 'toto'));
        configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.JHI_PREFIX, 'prefix'));
      });

      describe('when not passing an indentation', () => {
        it('should stringify it without indentation', () => {
          expect(configuration.toString()).to.equal(`config {
baseName toto
jhiPrefix prefix
}`);
        });
      });
      describe('when passing an indentation', () => {
        it('should stringify it with indentation', () => {
          expect(configuration.toString(2)).to.equal(`  config {
    baseName toto
    jhiPrefix prefix
  }`);
        });
      });
    });
    describe('when the configuration has the dto suffix option', () => {
      describe('without a value', () => {
        let configuration;

        before(() => {
          configuration = new JDLApplicationConfiguration();
          configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.DTO_SUFFIX, ''));
        });

        it('should not stringify it', () => {
          expect(configuration.toString()).not.to.include('dtoSuffix');
        });
      });
      describe('with a value', () => {
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
    describe('when the configuration has the entity suffix option', () => {
      describe('without a value', () => {
        let configuration;

        before(() => {
          configuration = new JDLApplicationConfiguration();
          configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.ENTITY_SUFFIX, ''));
        });

        it('should not stringify it', () => {
          expect(configuration.toString()).not.to.include('entitySuffix');
        });
      });
      describe('with a value', () => {
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
    describe('when the configuration has the client theme variant option', () => {
      describe('without a value', () => {
        let configuration;

        before(() => {
          configuration = new JDLApplicationConfiguration();
          configuration.setOption(new StringJDLApplicationConfigurationOption(OptionNames.CLIENT_THEME_VARIANT, ''));
        });

        it('should not stringify it', () => {
          expect(configuration.toString()).not.to.include('clientThemeVariant');
        });
      });
      describe('with a value', () => {
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
    describe('when the configuration has the package folder option', () => {
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
