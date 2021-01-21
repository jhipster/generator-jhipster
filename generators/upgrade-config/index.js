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

const BaseGenerator = require('../generator-base');
const { parseBluePrints } = require('../../utils/blueprint');

module.exports = class extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    if (this.options.help) {
      return;
    }

    this.force = this.options.force;

    this.skipInstall = this.options.skipInstall;
    this.silent = this.options.silent;
    this.skipChecks = this.options.skipChecks;

    // Verify 6.6.0 app blueprint bug
    if (!this.config.existed && !this.options.blueprints && !this.options.help) {
      this.error(
        'This seems to be an app blueprinted project with jhipster 6.6.0 bug (https://github.com/jhipster/generator-jhipster/issues/11045), you should pass --blueprints to jhipster upgrade commmand.'
      );
    }

    // Used for isJhipsterVersionLessThan on cleanup.upgradeFiles
    this.jhipsterOldVersion = this.config.get('jhipsterVersion');
  }

  get initializing() {
    return {
      validateFromCli: this.checkInvocationFromCLI,

      parseBlueprints() {
        this.blueprints = parseBluePrints(this.options.blueprints || this.config.get('blueprints') || this.config.get('blueprint'));
      },

      async unifyConfig() {
        this._migrateAllBlueprints();
      },
    };
  }

  /* ======================================================================== */
  /* private methods use within generator */
  /* ======================================================================== */

  /**
   * Look for every blueprint config and move them to 'generator-jhipster' namespace.
   */
  async _migrateAllBlueprints() {
    if (!this.isJhipsterVersionLessThan('6.6.1')) {
      const msg = `Skipping config upgrade, config generated with jhipster version: ${this.jhipsterOldVersion}`;
      if (this._debug && this._debug.enabled) {
        this._debug(msg);
      }
      this.info(msg);
      return;
    }
    if (this._debug) {
      this._debug('Running config upgrade');
    }
    const blueprintConfigs = this.blueprints.map(bp => bp.name).map(name => this._getStorage(name));
    await this._migrateConfigs(blueprintConfigs);
  }

  /**
   * Move configs to 'generator-jhipster' namespace.
   */
  async _migrateConfigs(blueprintConfigs) {
    if (!Array.isArray(blueprintConfigs)) {
      blueprintConfigs = [blueprintConfigs];
    }
    blueprintConfigs.forEach(bc => {
      Object.keys(bc.getAll()).forEach(key => {
        const blueprintValue = bc.get(key);
        const jhipsterValue = this.config.get(key);
        // Remove duplicated value
        if (jhipsterValue === blueprintValue || blueprintValue === undefined) {
          bc.delete(key);
        }
      });
    });

    // Get every config from blueprint configs and ask for conflict resolution.
    let keys = [];
    blueprintConfigs.forEach(bc => {
      keys = keys.concat(Object.keys(bc.getAll()));
    });
    keys = this._.uniq(keys);
    keys.forEach(key => {
      this.queueMethod(this._askConfigConflict.bind(this, key, blueprintConfigs), `${key}Prompt`, 'initializing');
      // this._askConfigConflict(key, blueprintConfigs);
    });
  }

  /**
   * Resolve configuration conflicts.
   */
  _askConfigConflict(key, blueprintConfigs) {
    const toChoice = function (config) {
      const value = config.get(key);
      return { name: `${config.name}: ${JSON.stringify(value)}`, value };
    };

    let choices = blueprintConfigs.map(bc => {
      return toChoice(bc);
    });
    choices = [toChoice(this.config), ...choices];
    choices = choices.filter(choice => choice.value !== undefined);
    choices = this._.uniq(choices, 'value');

    if (this._debug && this._debug.enabled) {
      this._debug('%o: %o', key, choices);
    }
    // No different value has been found
    if (choices.length === 0) {
      blueprintConfigs.forEach(bc => bc.delete(key));
      return undefined;
    }
    const abortChoice = 'abort (I will resolve it myself)';
    const ignoreChoice = 'ignore (I will take the risk)';
    const otherChoices = [...choices, ignoreChoice, abortChoice];
    return this.prompt({
      type: 'rawlist',
      name: `#${key}`,
      choices: otherChoices,
      message: `What is the config value for ${key}?`,
    }).then(
      function (answer) {
        const value = answer[`#${key}`];
        if (this._debug && this._debug.enabled) {
          this._debug('answer: %o', answer);
        }
        if (value === abortChoice) {
          throw new Error(
            `There are some configuration conflict, look at your .yo-rc.json at * => ${key}, one of ${JSON.stringify(choices)}`
          );
        }
        if (value !== undefined && value !== ignoreChoice) {
          this.config.set(key, value);
          blueprintConfigs.forEach(bc => bc.delete(key));
        } else {
          this.info(`There are some configuration conflict, look at your .yo-rc.json at * => ${key}, one of ${JSON.stringify(choices)}`);
        }
      }.bind(this)
    );
  }
};
