'use strict';
var util = require('util'),
    shelljs = require('shelljs'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    jhuml = require('jhipster-uml'),
    jdl = require('jhipster-domain-language'),
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
                    this.env.error(chalk.red('\nCould not find ' + key + ', make sure the path is correct!\n'));
                }
            }, this);
        },

        getConfig: function () {
            this.log('The jdl is being imported.');
            this.baseName = this.config.get('baseName');
            this.databaseType = this.config.get('databaseType');
        }
    },

    _filterScheduledClasses: function(classToFilter, scheduledClasses) {
        return scheduledClasses.filter(function(element) {
            return element !== classToFilter;
        });
    },

    _initDatabaseTypeHolder: function(databaseTypeName) {
        switch (databaseTypeName) {
        case 'mongodb':
            return jhuml.MongoDBTypes;
        case 'cassandra':
            return jhuml.CassandraTypes;
        default:
            return jhuml.SQLTypes;
        }
    },
    default: {
        insight: function () {
            var insight = this.insight();
            insight.trackWithEvent('generator', 'import-jdl');
        },

        parseJDL: function () {

            var Editors = jhuml.editors;
            var EntitiesCreator = jhuml.EntitiesCreator;
            var ClassScheduler = jhuml.ClassScheduler;

            var types = this._initDatabaseTypeHolder(this.databaseType);

            var parser = new Editors.Parsers.dsl(jdl.parseFromFiles(this.jdlFiles), types);
            var parsedData = parser.parse();
            var scheduler = new ClassScheduler(
                Object.keys(parsedData.classes),
                parsedData.associations
            );

            var scheduledClasses = scheduler.schedule();
            if (parsedData.userClassId) {
                scheduledClasses =
                this._filterScheduledClasses(parsedData.userClassId, scheduledClasses);
            }

            var creator = new EntitiesCreator(
                parsedData,
                parser.databaseTypes,
                [], {}, {}
            );

            creator.createEntities();
            if (!this.options['force']) {
                scheduledClasses = creator.filterOutUnchangedEntities(scheduledClasses);
            }
            creator.writeJSON(scheduledClasses);
        },

        generateEntities: function () {
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
        }
    },

    install: function () {
        var injectJsFilesToIndex = function () {
            this.log('\n' + chalk.bold.green('Running gulp Inject to add javascript to index\n'));
            this.spawnCommand('gulp', ['inject']);
        };
        if (!this.options['skip-install'] && !this.skipClient) {
            injectJsFilesToIndex.call(this);
        }
    }

});
