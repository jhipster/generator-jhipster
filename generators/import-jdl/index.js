const util = require('util');
const shelljs = require('shelljs');
const generator = require('yeoman-generator');
const chalk = require('chalk');
const jhiCore = require('jhipster-core');
const BaseGenerator = require('../generator-base');

const JDLGenerator = generator.extend({});

util.inherits(JDLGenerator, BaseGenerator);

module.exports = JDLGenerator.extend({
    constructor: function (...args) { // eslint-disable-line object-shorthand
        generator.apply(this, args);
        this.argument('jdlFiles', { type: Array, required: true });
        this.jdlFiles = this.options.jdlFiles;
    },

    initializing: {
        validate() {
            if (this.jdlFiles) {
                this.jdlFiles.forEach((key) => {
                    if (!shelljs.test('-f', key)) {
                        this.env.error(chalk.red(`\nCould not find ${key}, make sure the path is correct!\n`));
                    }
                });
            }
        },

        getConfig() {
            this.baseName = this.config.get('baseName');
            this.prodDatabaseType = this.config.get('prodDatabaseType');
            this.skipClient = this.config.get('skipClient');
            this.clientFramework = this.config.get('clientFramework');
            if (!this.clientFramework) {
                this.clientFramework = 'angular1';
            }
            this.clientPackageManager = this.config.get('clientPackageManager');
            if (!this.clientPackageManager) {
                if (this.useYarn) {
                    this.clientPackageManager = 'yarn';
                } else {
                    this.clientPackageManager = 'npm';
                }
            }
        }
    },

    default: {
        insight() {
            const insight = this.insight();
            insight.trackWithEvent('generator', 'import-jdl');
        },

        parseJDL() {
            this.log('The jdl is being parsed.');
            try {
                const jdlObject = jhiCore.convertToJDL(jhiCore.parseFromFiles(this.jdlFiles), this.prodDatabaseType);
                const entities = jhiCore.convertToJHipsterJSON({
                    jdlObject,
                    databaseType: this.prodDatabaseType
                });
                this.log('Writing entity JSON files.');
                jhiCore.exportToJSON(entities, this.options.force);
            } catch (e) {
                this.log(e);
                this.error('\nError while parsing entities from JDL\n');
            }
        },

        generateEntities() {
            this.log('Generating entities.');
            try {
                this.getExistingEntities().forEach((entity) => {
                    this.composeWith(require.resolve('../entity'), {
                        regenerate: true,
                        'skip-install': true,
                        'skip-client': entity.definition.skipClient,
                        'skip-server': entity.definition.skipServer,
                        'no-fluent-methods': entity.definition.noFluentMethod,
                        'skip-user-management': entity.definition.skipUserManagement,
                        arguments: [entity.name],
                    });
                });
            } catch (e) {
                this.error(`Error while generating entities from parsed JDL\n${e}`);
            }
        }
    },

    install() {
        const injectJsFilesToIndex = () => {
            this.log(`\n${chalk.bold.green('Running gulp Inject to add javascript to index\n')}`);
            this.spawnCommand('gulp', ['inject:app']);
        };
        // rebuild client for Angular
        const rebuildClient = () => {
            this.log(`\n${chalk.bold.green('Running `webpack:build:dev` to update client app')}\n`);
            this.spawnCommand(this.clientPackageManager, ['run', 'webpack:build:dev']);
        };

        if (!this.options['skip-install'] && !this.skipClient) {
            if (this.clientFramework === 'angular1') {
                injectJsFilesToIndex();
            } else {
                rebuildClient();
            }
        }
    }
});
