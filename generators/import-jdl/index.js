'use strict';
var util = require('util'),
    shelljs = require('shelljs'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    jhiCore = require('jhipster-core'),
    scriptBase = require('../generator-base');

var JDLGenerator = generators.Base.extend({});

util.inherits(JDLGenerator, scriptBase);

module.exports = JDLGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
        this.argument('jdlFiles', {type: Array, required: true});

    },

    initializing: {
        validate: function () {
            this.jdlFiles && this.jdlFiles.forEach(function (key) {
                if (!shelljs.test('-f', key)) {
                    this.env.error(chalk.red(`\nCould not find ${ key }, make sure the path is correct!\n`));
                }
            }, this);
        },

        getConfig: function () {
            this.baseName = this.config.get('baseName');
            this.prodDatabaseType = this.config.get('prodDatabaseType');
            this.skipClient = this.config.get('skipClient');
        }
    },

    default: {
        insight: function () {
            var insight = this.insight();
            insight.trackWithEvent('generator', 'import-jdl');
        },

        parseJDL: function () {
            this.log('The jdl is being parsed.');
            try {
                var jdlObject = jhiCore.convertToJDL(jhiCore.parseFromFiles(this.jdlFiles), this.prodDatabaseType);
                var entities = jhiCore.convertToJHipsterJSON({
                    jdlObject: jdlObject,
                    databaseType: this.prodDatabaseType
                });
                this.log('Writing entity JSON files.');
                jhiCore.exportToJSON(entities, this.options['force']);
            } catch (e) {
                this.log(e);
                this.error(`\nError while parsing entities from JDL\n`);
            }


        },

        generateEntities: function () {
            this.log('Generating entities.');
            try {
                this.getExistingEntities().forEach(function (entity) {
                    this.composeWith('jhipster:entity', {
                        options: {
                            regenerate: true,
                            'skip-install': true
                        },
                        args: [entity.name]
                    }, {
                        local: require.resolve('../entity')
                    });
                }, this);
            } catch (e) {
                this.error(`Error while generating entities from parsed JDL\n${ e }`);
            }

        }
    },

    install: function () {
        var injectJsFilesToIndex = function () {
            this.log('\n' + chalk.bold.green('Running gulp Inject to add javascript to index\n'));
            this.spawnCommand('gulp', ['inject:app']);
        };
        if (!this.options['skip-install'] && !this.skipClient) {
            injectJsFilesToIndex.call(this);
        }
    }

});
