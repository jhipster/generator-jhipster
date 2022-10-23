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
/* eslint-disable consistent-return */
const chalk = require('chalk');
const { generateMixedChain } = require('../../lib/support/mixin.cjs');
const GeneratorBaseEntity = require('../base/index.cjs');

const { GENERATOR_JAVA, GENERATOR_BOOTSTRAP_APPLICATION } = require('../generator-list.cjs');
const {
  PACKAGE_NAME,
  PACKAGE_NAME_DEFAULT_VALUE,
  PRETTIER_JAVA_INDENT,
  PRETTIER_JAVA_INDENT_DEFAULT_VALUE,
  BUILD_TOOL,
  BUILD_TOOL_DEFAULT_VALUE,
  BUILD_TOOL_PROMPT_CHOICES,
} = require('./constants.cjs');
const { files } = require('./files.cjs');
const { dependencyChain } = require('./mixin.cjs');

const MixedChain = generateMixedChain(GeneratorBaseEntity, GENERATOR_JAVA);

/**
 * @class
 * @extends {import('../base/index.mjs')}
 */
module.exports = class extends MixedChain {
  constructor(args, options, features) {
    super(args, options, { jhipsterModular: true, unique: 'namespace', ...features });

    // Register options available to cli.
    if (!this.fromBlueprint) {
      this.registerCommonOptions();
      this.registerChainOptions();
    }

    // Application context for templates
    this.application = {};

    if (this.options.help) return;

    if (this.options.defaults) {
      this.configureChain();
    }
  }

  async _postConstruct() {
    this.loadStoredAppOptions();
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
  }

  async _beforeQueue() {
    if (!this.fromBlueprint) {
      const configure = this.options.configure || !this.shouldComposeModular();
      for (const generator of dependencyChain) {
        await this.dependsOnJHipster(generator, [], { configure });
      }
      await this.composeWithBlueprints(GENERATOR_JAVA);
    }
  }

  get initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },
      sayHello() {
        if (!this.showHello()) return;
        this.log(chalk.white('⬢ Welcome to the JHipster Java ⬢'));
      },
      loadRuntimeOptions() {
        this.loadRuntimeOptions();
      },
      loadOptionsConstants() {
        this.loadChainOptionsConstants();
      },
    };
  }

  get [MixedChain.INITIALIZING]() {
    if (this.delegateToBlueprint) return;
    return this.initializing;
  }

  get prompting() {
    return {
      async showPrompts() {
        if (this.shouldSkipPrompts()) return;
        await this.prompt(
          [
            {
              name: PACKAGE_NAME,
              type: 'input',
              validate: input => this.validatePackageName(input),
              message: 'What is your default Java package name?',
              default: () => this.sharedData.getConfigDefaultValue(PACKAGE_NAME, PACKAGE_NAME_DEFAULT_VALUE),
            },
            {
              name: PRETTIER_JAVA_INDENT,
              type: 'input',
              message: 'What is the Java indentation?',
              default: () => this.sharedData.getConfigDefaultValue(PRETTIER_JAVA_INDENT, PRETTIER_JAVA_INDENT_DEFAULT_VALUE),
            },
            {
              name: BUILD_TOOL,
              type: 'list',
              message: 'What tool do you want to use to build backend?',
              choices: () => this.sharedData.getConfigChoices(BUILD_TOOL, BUILD_TOOL_PROMPT_CHOICES),
              default: () => this.sharedData.getConfigDefaultValue(BUILD_TOOL, BUILD_TOOL_DEFAULT_VALUE),
            },
          ],
          this.config
        );
      },
    };
  }

  get [MixedChain.PROMPTING]() {
    if (this.delegateToBlueprint) return;
    return this.prompting;
  }

  get configuring() {
    return {
      configure() {
        this.configureJava();
      },
    };
  }

  get [MixedChain.CONFIGURING]() {
    if (this.delegateToBlueprint) return;
    return this.configuring;
  }

  get composing() {
    return {
      async compose() {
        if (!this.shouldComposeModular()) return;
        await this.composeWithJavaConfig();
      },
    };
  }

  get [MixedChain.COMPOSING]() {
    if (this.delegateToBlueprint) return;
    return this.composing;
  }

  get loading() {
    return {
      configureChain() {
        this.configureChain();
      },
      loadConstants() {
        this.loadChainConstants(this.application);
      },
      loadConfig() {
        this.loadChainConfig(this.application);
      },
    };
  }

  get [MixedChain.LOADING]() {
    if (this.delegateToBlueprint) return;
    return this.loading;
  }

  get preparing() {
    return {
      prepareDerivedProperties() {
        this.prepareChainDerivedProperties(this.application);
      },
    };
  }

  get [MixedChain.PREPARING]() {
    if (this.delegateToBlueprint) return;
    return this.preparing;
  }

  get writing() {
    return {
      async writeFiles() {
        if (this.shouldSkipFiles()) return;
        await this.writeFiles({ sections: files, context: this.application });
      },
    };
  }

  get [MixedChain.WRITING]() {
    if (this.delegateToBlueprint) return;
    return this.writing;
  }

  /*
   * Start of local public API, blueprints may override to customize the generator behavior.
   */

  /**
   * Validates packageName
   * @param {string} input - Package name to be checked
   * @returns {Boolean|string} true if valid, error message otherwise
   */
  validatePackageName(input) {
    if (!/^([a-z_]{1}[a-z0-9_]*(\.[a-z_]{1}[a-z0-9_]*)*)$/.test(input)) {
      return 'The package name you have provided is not a valid Java package name.';
    }
    return true;
  }
};
