'use strict';
var util = require('util'),
shelljs = require('shelljs'),
generators = require('yeoman-generator'),
chalk = require('chalk'),
jhuml = require("jhipster-uml"),
scriptBase = require('../generator-base');

const constants = require('../generator-constants'),
SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;

var JDLGenerator = generators.Base.extend({});

util.inherits(JDLGenerator, scriptBase);

module.exports = JDLGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
        this.argument('jdlFile', {type: String, required: true});
    },

    initializing: {
        validate: function () {
            if (!shelljs.test('-f', this.jdlFile)) {
                this.env.error(chalk.red('\nCould not find ' + this.jdlFile + ', make sure the path is correct!\n'));
            }
        },

        getConfig: function () {
            this.log('The jdl is being imported.');
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
            case 'sql':
            return jhuml.SQLTypes;
            case 'mongodb':
            return jhuml.MongoDBTypes;
            case 'cassandra':
            return jhuml.CassandraTypes;
            default:
            return jhuml.SQLTypes;
        }
    },
    default: {

        parseJDL: function () {

            Editors = jhuml.editors;
            self.entityGenerator = jhuml.entityGenerator;
            self.EntitiesCreator = jhuml.EntitiesCreator;
            ClassScheduler = jhuml.ClassScheduler;
            self.cardinalities = cardinalities;

            var types = this._initDatabaseTypeHolder(this.databaseType);

            var parser = new Editors.Parsers['dsl'](this.jdlFile, types);
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
                [], {}, {});

                creator.createEntities();
                if (!this.options['force']) {
                    scheduledClasses = creator.filterOutUnchangedEntities(scheduledClasses);
                }
                creator.writeJSON(scheduledClasses);
            }
        },

        generateEntities: function () {

        }

    });
