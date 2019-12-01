/* eslint-disable consistent-return */
const chalk = require('chalk');
const LanguagesGenerator = require('generator-jhipster/generators/languages');
const utils = require('../utils');

module.exports = class extends LanguagesGenerator {
    constructor(args, opts) {
        super(args, Object.assign({ fromBlueprint: true }, opts)); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(
                `This is a JHipster blueprint and should be used only like ${chalk.yellow(
                    'jhipster languages --blueprints vuejs'
                )}`
            );
        }

        this.configOptions = jhContext.configOptions || {};
        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupClientOptions(this, jhContext);
    }

    get initializing() {
        return super._initializing();
    }

    get prompting() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._prompting();
    }

    get configuring() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._configuring();
    }

    get default() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._default();
    }

    get writing() {
        const phaseFromJHipster = super._writing();
        const customPhaseSteps = {
            write() {
                utils.updateLanguagesInTranslationStore(this);
                utils.updateI18nConfig(this);
                utils.updateLanguagesInWebpack(this);
            }
        };
        return Object.assign(phaseFromJHipster, customPhaseSteps);
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }
};
