const EntityClientGenerator = require('generator-jhipster/generators/entity-client');
const jhipsterUtils = require('generator-jhipster/generators/utils');
const prompts = require('./prompts');
const chalk = require('chalk');

module.exports = class extends EntityClientGenerator {
    constructor(args, opts) {
        super(args, Object.assign({ fromBlueprint: true }, opts)); // fromBlueprint variable is important
        // Get missing configuration
        const configuration = jhipsterUtils.getAllJhipsterConfig(null, true);
        this.skipClient = configuration.skipClient;
        this.clientPackageManager = configuration.clientPackageManager;
        this.enableTranslation = configuration.enableTranslation;
        this.protractorTests = configuration.testFrameworks.includes('protractor');
    }

    get prompting() {
        // The prompting phase is being overriden so that we can ask our own questions
        return {
            askForPage: prompts.askForPage
        };
    }

    get writing() {
        return {
            writeAdditionalFile() {
            }
        };
    }

    get end() {
        return {
            end() {
                if (!this.options['skip-install'] && !this.skipClient) {
                    try{
                        this.rebuildClient();
                    } catch(e) {
                        console.log(e);
                    }
                }
                this.log(chalk.bold.green(`Page ${this.pageName} generated successfully.`));
            }
        };
    }
};
