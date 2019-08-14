/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
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
const _ = require('lodash');
const debug = require('debug')('jhipster:configuration');

const packagejs = require('../package.json');
const app = require('./app/configs');
const common = require('./common/configs');

module.exports = class {
    constructor(generator, rootConfiguration = true, rootOptions = generator.options, rootConfig = generator.config) {
        debug('Instanciating Configuration');
        this.rootOptions = rootOptions || {};
        this.rootConfig = rootConfig || {};

        /**
         * Initialize persistentOptions with current persisted config.
         */
        const persistedConfig = this.rootConfig.getAll() || {};
        this.persistentOptions = {
            ...persistedConfig
        };

        if (rootConfiguration) this.persistentOptions.jhipsterVersion = packagejs.version;

        /**
         * Initialize runtimeOptions.
         */
        this.runtimeOptions = {};

        /**
         * Keep track of queued prompts.
         */
        this.queuedPrompts = [];

        /**
         * Initialize the module configuration.
         * {
         *     persistent: Boolean, true if the config should be stored
         *     cli: Boolean, this will install the option with generator.option(cliName, spec);
         *     cliName: String, the parameter that will be used for this option
         *     spec: Object, cli option specification
         *     vars: Array of String, configs that are related
         *     prompt: Function, the prompt
         * }
         */
        this.modulesConfigs = {};
        /**
         * Same as module configuration, but was blueprintName as root.
         * And has a dedicated persistentOptions.
         */
        this.blueprintsConfigs = {};

        /**
         * Skip registering the configs.
         */
        if (!rootConfiguration) return;

        /**
         * Queue the saveConfig
         */
        generator.queueMethod(saveConf.bind(this, generator), 'SaveConfig', 'default');

        /**
         * Register jhispter implemented modules
         * Blueprints can register and require their own configs at the module constructor
         */
        this.registerConfigs(app);
        this.registerConfigs(common);
    }

    /**
     * Get all runtime options.
     */
    getRuntimeOptions() {
        return this.runtimeOptions;
    }

    /**
     * Get an runtime option value.
     */
    getRuntimeOption(name) {
        return this.runtimeOptions[name];
    }

    /**
     * Get all persistent configs.
     * Problably for persisting to disk.
     */
    getPersistentOptions(blueprint) {
        if (blueprint === undefined) return this.persistentOptions;
        return this.blueprintsConfigs[blueprint].persistentOptions;
    }

    /**
     * Get an persistent config value.
     */
    getPersistentOption(configName, blueprint) {
        return this.getPersistentOptions(blueprint)[configName];
    }

    /**
     * Look for a config in persistent config, then runtime config.
     */
    findOptionValue(name) {
        return this.persistentOptions[name] || this.runtimeOptions[name];
    }

    /**
     * Look for a config in persistent config, then runtime config.
     */
    getAllOptions() {
        let opts = {};
        Object.entries(this.blueprintsConfigs).forEach(([blueprintName, config]) => {
            const persOpts = config.persistentOptions;
            opts = { ...opts, persOpts };
        });
        return {
            ...opts,
            ...this.runtimeOptions,
            ...this.persistentOptions
        };
    }

    /**
     * Return the config repository acording to the config spec.
     */
    findRepository(config) {
        let repository;
        if (config.persistent && config.blueprintName !== undefined) {
            repository = this.blueprintsConfigs[config.blueprintName].persistentOptions;
        } else {
            repository = !config.persistent ? this.runtimeOptions : this.persistentOptions;
        }
        return repository;
    }

    /**
     * Install the option to generator.options and configOptions for compatibility
     */
    installOption(generator, key, value) {
        generator[key] = value;
        // TODO remove options setter and eliminate configOptions.
        // if (generator.options) generator.options[key] = value;
        // TODO eliminate configOptions.
        if (generator.configOptions) generator.configOptions[key] = value;
    }

    /**
     * Install cli options and queue prompts.
     */
    requireAllConfigs(generator, module, blueprint) {
        this.installCliConfigs(generator, module, blueprint);
        this.queueConfigPrompts(generator, module, blueprint);
    }

    /**
     * Install CLI options
     */
    installCliConfigs(generator, module, blueprint) {
        const configs = blueprint !== undefined ? this.blueprintsConfigs[blueprint][module] : this.modulesConfigs[module];
        Object.entries(configs).forEach(([optName, config]) => {
            if (!config.cli) return;

            const camelCase = _.camelCase(config.cliName);
            const repository = this.findRepository(config);
            if (repository[camelCase] !== undefined) return;

            generator.option(config.cliName, config.spec);

            const value = (repository[camelCase] = this.rootOptions[config.cliName]);
            // debug(`cli ${optName} = ${config}`);

            if (value !== undefined) {
                this.installOption(generator, camelCase, value);
            }
        });
    }

    /**
     * Queue prompts.
     */
    queueConfigPrompts(generator, module, blueprint) {
        debug('queueConfigPrompts');
        Object.entries(this.requirePrompts(generator, module, blueprint)).forEach(([key, spec]) => {
            this.queueConfigPrompt(generator, module, key, spec);
        });
    }

    /**
     * Queue prompt.
     * Ignore if the config already exists.
     */
    queueConfigPrompt(generator, module, key, spec) {
        const self = this;
        const config = spec.config;
        const repository = self.findRepository(spec.config);

        let value = repository[config.varName];
        if (value === undefined) {
            value = repository[config.varName] = this.rootOptions[config.varName] || this.rootConfig.get(config.varName);
        }
        const shouldRunPrompt = value === undefined;

        const promptIfUndefined = function(name, spec) {
            if (self.findOptionValue(name) !== undefined) return;
            spec.config.prompt.apply(self, [this, repository]);
        };
        const installConfig = function(name, spec) {
            self.installOption(this, name, self.findOptionValue(name));
            spec.config.otherVars &&
                spec.config.otherVars.forEach(configName => {
                    self.installOption(this, name, self.findOptionValue(name));
                });
        };

        const promptName = `${module}.${key}`;
        if (spec.config.dependsOn !== undefined) {
            spec.config.dependsOn.forEach(dependency => {
                const split = dependency.split('.');
                const dSpec = this.requirePrompt(generator, split[0], split[1], undefined);
                if (dSpec !== undefined) {
                    debug(`${key} depends on ${split[0]}.${split[1]}: ${dSpec}`);
                    this.queueConfigPrompt(generator, split[0], split[1], dSpec);
                }
            });
        }
        if (shouldRunPrompt && !this.queuedPrompts.includes(promptName)) {
            this.queuedPrompts.push(promptName);
            generator.queueMethod(
                promptIfUndefined.bind(generator, key, spec),
                `${promptName}Prompt`,
                spec.config.promptQueue || 'prompting'
            );
        }
        const validateName = `${promptName}Validate`;
        if (spec.config.validate && !this.queuedPrompts.includes(validateName)) {
            this.queuedPrompts.push(validateName);
            generator.queueMethod(
                spec.config.validate.bind(generator, repository),
                `${promptName}Validate`,
                spec.config.configQueue || 'configuring'
            );
        }
        generator.queueMethod(installConfig.bind(generator, key, spec), `${promptName}Config`, spec.config.configQueue || 'configuring');
    }

    /**
     * Get the required prompts.
     */
    requirePrompts(generator, module, blueprint) {
        debug('requirePrompts');
        const prompts = {};
        const configs = blueprint !== undefined ? this.blueprintsConfigs[blueprint][module] : this.modulesConfigs[module];
        Object.entries(configs).forEach(([optName, config]) => {
            debug(`require ${optName} = ${config}`);
            const spec = this.parsePrompt(generator, config);
            debug(`Found spec ${spec} for ${optName}`);
            if (spec) prompts[optName] = spec;
        });
        return prompts;
    }

    /**
     * Get the required prompt.
     */
    requirePrompt(generator, module, configName, blueprint) {
        debug('requirePrompt');
        const config =
            blueprint !== undefined ? this.blueprintsConfigs[blueprint][module][configName] : this.modulesConfigs[module][configName];
        return this.parsePrompt(generator, config);
    }

    /**
     * Parse the required prompts.
     */
    parsePrompt(generator, config) {
        const repository = this.findRepository(config);
        if (config.prompt instanceof Function) {
            return { repository, config };
        }
        if (config.install instanceof Function) {
            config.install(generator, repository);
        }
        return undefined;
    }

    /**
     * Initialize configs for the blueprint.
     */
    registerBlueprint(generator, blueprintName) {
        debug(`Registering blueprint ${blueprintName}`);
        this.blueprintsConfigs[blueprintName] = this.blueprintsConfigs[blueprintName] || {};
        this.blueprintsConfigs[blueprintName].persistentOptions = this.blueprintsConfigs[blueprintName].persistentOptions || {};
        this.blueprintsConfigs[blueprintName].config = this.blueprintsConfigs[blueprintName].config || generator._getStorage(blueprintName);

        /**
         * Queue the saveConfig for the blueprints
         */
        generator.queueMethod(saveConf.bind(this, generator, blueprintName), `${blueprintName}SaveConfig`, 'default');
    }

    /**
     * Register configs.
     */
    registerConfigs(configs, blueprint) {
        Object.entries(configs).forEach(([module, moduleConfigs]) => {
            this.registerModuleConfigs(moduleConfigs, module, blueprint);
        });
    }

    /**
     * Register one config.
     */
    registerModuleConfigs(configs, module, blueprintName) {
        debug(`Registering config ${module} ${blueprintName}`);
        let moduleConfigs;
        if (blueprintName === undefined) {
            moduleConfigs = this.modulesConfigs[module] = this.modulesConfigs[module] || {};
        } else {
            const blueprintConfig = (this.blueprintsConfigs[blueprintName] = this.blueprintsConfigs[blueprintName] || {});
            blueprintConfig.persistentOptions = blueprintConfig.persistentOptions || {};
            moduleConfigs = blueprintConfig[module] = blueprintConfig[module] || {};

            // Set blueprintName on the config spec
            Object.entries(configs).forEach(([configName, configSpec]) => {
                configSpec.blueprintName = blueprintName;
            });
        }
        _.merge(moduleConfigs, configs);
    }
};

function saveConf(generator, blueprintName) {
    const configuration = this;
    if (blueprintName) {
        const blueprintConfig = generator.configuration.blueprintsConfigs[blueprintName];
        if (!blueprintConfig) {
            debug(`blueprintConfig not found for ${blueprintName}, ignoring`);
        } else {
            configuration.blueprintsConfigs[blueprintName].config.set(configuration.getPersistentOptions(blueprintName));
        }
        return;
    }
    generator.config.set(generator.configuration.getPersistentOptions(blueprintName));
}
