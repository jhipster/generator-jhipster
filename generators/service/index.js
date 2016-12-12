'use strict';
var util = require('util'),
    generators = require('yeoman-generator'),
    _ = require('lodash'),
    scriptBase = require('../generator-base');

const constants = require('../generator-constants'),
    SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;

var ServiceGenerator = generators.Base.extend({});

util.inherits(ServiceGenerator, scriptBase);

module.exports = ServiceGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
        this.argument('name', {type: String, required: true});
    },

    initializing: {
        getConfig: function () {
            this.log('The service ' + this.name + ' is being created.');
            this.baseName = this.config.get('baseName');
            this.packageName = this.config.get('packageName');
            this.packageFolder = this.config.get('packageFolder');
            this.databaseType = this.config.get('databaseType');
        }
    },

    prompting: function () {
        var done = this.async();

        var prompts = [
            {
                type: 'confirm',
                name: 'useInterface',
                message: '(1/1) Do you want to use an interface for your service?',
                default: false
            }
        ];
        this.prompt(prompts).then(function (props) {
            this.useInterface = props.useInterface;
            done();
        }.bind(this));
    },
    default: {
        insight: function () {
            var insight = this.insight();
            insight.trackWithEvent('generator', 'service');
            insight.track('service/interface', this.useInterface);
        }
    },

    writing: function () {
        this.serviceClass = _.upperFirst(this.name);
        this.serviceInstance = this.name.toLowerCase();

        this.template(SERVER_MAIN_SRC_DIR + 'package/service/_Service.java',
            SERVER_MAIN_SRC_DIR + this.packageFolder + '/service/' + this.serviceClass + 'Service.java');

        if (this.useInterface) {
            this.template(SERVER_MAIN_SRC_DIR + 'package/service/impl/_ServiceImpl.java',
                SERVER_MAIN_SRC_DIR + this.packageFolder + '/service/impl/' + this.serviceClass + 'ServiceImpl.java');
        }
    }

});
