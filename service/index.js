'use strict';
var util = require('util'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('underscore.string'),
    scriptBase = require('../script-base');

var ServiceGenerator = generators.Base.extend({});

util.inherits(ServiceGenerator, scriptBase);

module.exports = ServiceGenerator.extend({
    constructor: function() {
        generators.Base.apply(this, arguments);
        this.argument('name', { type: String, required: true });
    },

    initializing : {
        getConfig : function () {
            this.log('The service ' + this.name + ' is being created.');
            this.baseName = this.config.get('baseName');
            this.packageName = this.config.get('packageName');
            this.packageFolder = this.config.get('packageFolder');
            this.databaseType = this.config.get('databaseType');
        }
    },

    prompting : function () {
        var cb = this.async();

        var prompts = [
        {
            type: 'confirm',
            name: 'useInterface',
            message: '(1/1) Do you want to use an interface for your service?',
            default: false
        }
        ]
        this.prompt(prompts, function (props) {
            this.useInterface = props.useInterface;
            cb();
        }.bind(this));
    },

    writing : function () {
        this.serviceClass = _.capitalize(this.name);
        this.serviceInstance = this.name.toLowerCase();
        var insight = this.insight();
        insight.track('generator', 'service');
        insight.track('service/interface', this.useInterface);

        this.template('src/main/java/package/service/_Service.java',
        'src/main/java/' + this.packageFolder + '/service/' +  this.serviceClass + 'Service.java');

        if (this.useInterface) {
            this.template('src/main/java/package/service/impl/_ServiceImpl.java',
            'src/main/java/' + this.packageFolder + '/service/impl/' +  this.serviceClass + 'ServiceImpl.java');
        }
    }

});
