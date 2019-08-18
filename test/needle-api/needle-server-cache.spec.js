const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const ServerGenerator = require('../../generators/server');
const constants = require('../../generators/generator-constants');

const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;

const mockBlueprintSubGen = class extends ServerGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error('This is a JHipster blueprint and should be used only like jhipster --blueprint myblueprint');
        }

        this.configOptions = jhContext.configOptions || {};
        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupServerOptions(this, jhContext);
    }

    get initializing() {
        return super._initializing();
    }

    get prompting() {
        return super._prompting();
    }

    get configuring() {
        return super._configuring();
    }

    get default() {
        return super._default();
    }

    get writing() {
        const phaseFromJHipster = super._writing();
        const customPhaseSteps = {
            ehCacheStep() {
                if (this.cacheProvider === 'ehcache') {
                    this.addEntryToEhcache('entry', 'com/mycompany/myapp');
                    this.addEntityToEhcache(
                        'entityClass',
                        [
                            { relationshipType: 'one-to-many', relationshipFieldNamePlural: 'entitiesOneToMany' },
                            { relationshipType: 'many-to-many', relationshipFieldNamePlural: 'entitiesManoToMany' }
                        ],
                        'com.mycompany.myapp',
                        'com/mycompany/myapp'
                    );
                }
            },
            infinispanCacheStep() {
                if (this.cacheProvider === 'infinispan') {
                    this.addEntryToCache('entry', 'com/mycompany/myapp', 'infinispan');
                    this.addEntityToCache(
                        'entityClass',
                        [
                            { relationshipType: 'one-to-many', relationshipFieldNamePlural: 'entitiesOneToMany' },
                            { relationshipType: 'many-to-many', relationshipFieldNamePlural: 'entitiesManoToMany' }
                        ],
                        'com.mycompany.myapp',
                        'com/mycompany/myapp',
                        'infinispan'
                    );
                }
            }
        };
        return { ...phaseFromJHipster, ...customPhaseSteps };
    }
};

describe('needle API server cache: JHipster server generator with blueprint', () => {
    describe('ehcache', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../../generators/server'))
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'myblueprint',
                    skipChecks: true
                })
                .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:server']])
                .withPrompts({
                    baseName: 'jhipster',
                    packageName: 'com.mycompany.myapp',
                    packageFolder: 'com/mycompany/myapp',
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    cacheProvider: 'ehcache',
                    enableHibernateCache: true,
                    databaseType: 'sql',
                    devDatabaseType: 'h2Memory',
                    prodDatabaseType: 'mysql',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    buildTool: 'maven',
                    rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                    serverSideOptions: []
                })
                .on('end', done);
        });

        it('Assert ehCache configuration has entry added', () => {
            assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`, 'createCache(cm, entry);');
        });

        it('Assert ehCache configuration has entity added', () => {
            assert.fileContent(
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
                'createCache(cm, com.mycompany.myapp.domain.entityClass.class.getName());'
            );
            assert.fileContent(
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
                'createCache(cm, com.mycompany.myapp.domain.entityClass.class.getName() + ".entitiesOneToMany");'
            );
            assert.fileContent(
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
                'createCache(cm, com.mycompany.myapp.domain.entityClass.class.getName() + ".entitiesManoToMany");'
            );
        });
    });

    describe('infinispan', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../../generators/server'))
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'myblueprint',
                    skipChecks: true
                })
                .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:server']])
                .withPrompts({
                    baseName: 'jhipster',
                    packageName: 'com.mycompany.myapp',
                    packageFolder: 'com/mycompany/myapp',
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    cacheProvider: 'infinispan',
                    enableHibernateCache: true,
                    databaseType: 'sql',
                    devDatabaseType: 'h2Memory',
                    prodDatabaseType: 'mysql',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    buildTool: 'maven',
                    rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                    serverSideOptions: []
                })
                .on('end', done);
        });

        it('Assert Infinispan configuration has entity added', () => {
            assert.fileContent(
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
                '            registerPredefinedCache(entry, new JCache<Object, Object>(\n' +
                    '                cacheManager.getCache(entry).getAdvancedCache(), this,\n' +
                    '                ConfigurationAdapter.create()));'
            );
        });

        it('Assert Infinispan configuration has entity added', () => {
            assert.fileContent(
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
                '            registerPredefinedCache(com.mycompany.myapp.domain.entityClass.class.getName(), new JCache<Object, Object>(\n' +
                    '                cacheManager.getCache(com.mycompany.myapp.domain.entityClass.class.getName()).getAdvancedCache(), this,\n' +
                    '                ConfigurationAdapter.create()));'
            );
            assert.fileContent(
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
                '            registerPredefinedCache(com.mycompany.myapp.domain.entityClass.class.getName() + ".entitiesOneToMany", new JCache<Object, Object>(\n' +
                    '                cacheManager.getCache(com.mycompany.myapp.domain.entityClass.class.getName() + ".entitiesOneToMany").getAdvancedCache(), this,\n' +
                    '                ConfigurationAdapter.create()));'
            );
            assert.fileContent(
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
                '            registerPredefinedCache(com.mycompany.myapp.domain.entityClass.class.getName() + ".entitiesManoToMany", new JCache<Object, Object>(\n' +
                    '                cacheManager.getCache(com.mycompany.myapp.domain.entityClass.class.getName() + ".entitiesManoToMany").getAdvancedCache(), this,\n' +
                    '                ConfigurationAdapter.create()));'
            );
        });
    });
});
