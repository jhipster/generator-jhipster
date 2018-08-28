/* eslint-disable consistent-return */
const chalk = require('chalk');
const EntityClientGenerator = require('generator-jhipster/generators/entity-client');
const writeFiles = require('./files').writeFiles;

module.exports = class extends EntityClientGenerator {
    constructor(args, opts) {
        super(args, Object.assign({ fromBlueprint: true }, opts)); // fromBlueprint variable is important

        //this.configOptions = this.options.configOptions || {};
        //this.setupClientOptions(this);
        /*const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster entity-cient VueJS blueprint and should be used only like ${chalk.yellow('jhipster --blueprint vuejs')}`);
        }

        this.configOptions = jhContext.configOptions || {};*/
    }


    get writing() {

      //const phaseFromJHipster = super._writing();
      return {
          writeAdditionalFile() {
              writeFiles.call(this);
          }
      };
      //return Object.assign(phaseFromJHipster, customPhaseSteps);
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }
};
