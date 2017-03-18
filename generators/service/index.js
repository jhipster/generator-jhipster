const util = require('util');
const generator = require('yeoman-generator');
const _ = require('lodash');
const BaseGenerator = require('../generator-base');
const constants = require('../generator-constants');

const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;

const ServiceGenerator = generator.extend({});

util.inherits(ServiceGenerator, BaseGenerator);

module.exports = ServiceGenerator.extend({
    constructor: function (...args) { // eslint-disable-line object-shorthand
        generator.apply(this, args);
        this.argument('name', { type: String, required: true });
        this.name = this.options.name;
    },

    initializing: {
        getConfig() {
            this.log(`The service ${this.name} is being created.`);
            this.baseName = this.config.get('baseName');
            this.packageName = this.config.get('packageName');
            this.packageFolder = this.config.get('packageFolder');
            this.databaseType = this.config.get('databaseType');
        }
    },

    prompting() {
        const done = this.async();

        const prompts = [
            {
                type: 'confirm',
                name: 'useInterface',
                message: '(1/1) Do you want to use an interface for your service?',
                default: false
            }
        ];
        this.prompt(prompts).then((props) => {
            this.useInterface = props.useInterface;
            done();
        });
    },
    default: {
        insight() {
            const insight = this.insight();
            insight.trackWithEvent('generator', 'service');
            insight.track('service/interface', this.useInterface);
        }
    },

    writing() {
        this.serviceClass = _.upperFirst(this.name);
        this.serviceInstance = _.lowerCase(this.name);

        this.template(`${SERVER_MAIN_SRC_DIR}package/service/_Service.java`,
            `${SERVER_MAIN_SRC_DIR + this.packageFolder}/service/${this.serviceClass}Service.java`);

        if (this.useInterface) {
            this.template(`${SERVER_MAIN_SRC_DIR}package/service/impl/_ServiceImpl.java`,
                `${SERVER_MAIN_SRC_DIR + this.packageFolder}/service/impl/${this.serviceClass}ServiceImpl.java`);
        }
    }

});
