'use strict';
var util = require('util'),
    chalk = require('chalk'),
    generators = require('yeoman-generator'),
    jhiCore = require('jhipster-core'),
    scriptBase = require('../generator-base');

var ExportJDLGenerator = generators.Base.extend({});

util.inherits(ExportJDLGenerator, scriptBase);

module.exports = ExportJDLGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
        this.baseName = this.config.get('baseName');
        this.jdl = new jhiCore.JDLObject();
        this.argument('jdlFile', { type: String, required: false, defaults: this.baseName + '.jh' });
    },

    default: {
        insight: function () {
            var insight = this.insight();
            insight.trackWithEvent('generator', 'export-jdl');
        },

        parseJson: function () {
            this.log('Parsing entities from .jhipster dir...');
            try {
                let entities = {};
                this.getExistingEntities().forEach( entity => entities[entity.name] = entity.definition );
                jhiCore.convertJsonEntitiesToJDL(entities, this.jdl);
                jhiCore.convertJsonServerOptionsToJDL({'generator-jhipster': this.config.getAll()}, this.jdl);
            } catch (e) {
                this.log(e.message || e);
                this.error('\nError while parsing entities to JDL\n');
            }
        }
    },

    writing: function () {
        let content = '// JDL definition for application \'' + this.baseName + '\' generated with command \'yo jhipster:export-jdl\'\n\n' + this.jdl.toString();
        this.fs.write(this.jdlFile, content);
    },

    end: function() {
        this.log(chalk.green.bold('\nEntities successfully exported to JDL file\n'));
    }

});
