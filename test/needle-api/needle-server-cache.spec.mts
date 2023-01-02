import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import ServerGenerator from '../../generators/server/index.mjs';
import { SERVER_MAIN_SRC_DIR } from '../../generators/generator-constants.mjs';
import { getGenerator } from '../support/index.mjs';
import { serviceDiscoveryTypes } from '../../jdl/jhipster/index.mjs';

const NO_SERVICE_DISCOVERY = serviceDiscoveryTypes.NO;
const DEFAULT_TEST_OPTIONS = { skipInstall: true, skipChecks: true, skipPrettier: true };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockBlueprintSubGen: any = class extends ServerGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

    if (!jhContext) {
      this.error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.sbsBlueprint = true;
  }

  get [ServerGenerator.POST_WRITING]() {
    return {
      ehCacheStep() {
        if (this.jhipsterConfig.cacheProvider === 'ehcache') {
          this.addEntryToEhcache('entry', 'com/mycompany/myapp');
          this.addEntityToEhcache(
            'entityClass',
            [
              { relationshipType: 'one-to-many', relationshipFieldNamePlural: 'entitiesOneToMany' },
              { relationshipType: 'many-to-many', relationshipFieldNamePlural: 'entitiesManoToMany' },
            ],
            'com.mycompany.myapp',
            'com/mycompany/myapp'
          );
        }
      },
      caffeineStep() {
        if (this.jhipsterConfig.cacheProvider === 'caffeine') {
          this.addEntryToCache('entry', 'com/mycompany/myapp', 'caffeine');
          this.addEntityToCache(
            'entityClass',
            [
              { relationshipType: 'one-to-many', relationshipFieldNamePlural: 'entitiesOneToMany' },
              { relationshipType: 'many-to-many', relationshipFieldNamePlural: 'entitiesManoToMany' },
            ],
            'com.mycompany.myapp',
            'com/mycompany/myapp',
            'caffeine'
          );
        }
      },
      infinispanCacheStep() {
        if (this.jhipsterConfig.cacheProvider === 'infinispan') {
          this.addEntryToCache('entry', 'com/mycompany/myapp', 'infinispan');
          this.addEntityToCache(
            'entityClass',
            [
              { relationshipType: 'one-to-many', relationshipFieldNamePlural: 'entitiesOneToMany' },
              { relationshipType: 'many-to-many', relationshipFieldNamePlural: 'entitiesManoToMany' },
            ],
            'com.mycompany.myapp',
            'com/mycompany/myapp',
            'infinispan'
          );
        }
      },
      redisCacheStep() {
        if (this.jhipsterConfig.cacheProvider === 'redis') {
          this.addEntryToCache('entry', 'com/mycompany/myapp', 'redis');
          this.addEntityToCache(
            'entityClass',
            [
              { relationshipType: 'one-to-many', relationshipFieldNamePlural: 'entitiesOneToMany' },
              { relationshipType: 'many-to-many', relationshipFieldNamePlural: 'entitiesManoToMany' },
            ],
            'com.mycompany.myapp',
            'com/mycompany/myapp',
            'redis'
          );
        }
      },
    };
  }
};

describe('needle API server cache: JHipster server generator with blueprint', () => {
  describe('ehcache', () => {
    before(done => {
      helpers
        .run(getGenerator('server'))
        .withOptions({
          ...DEFAULT_TEST_OPTIONS,
          blueprint: 'myblueprint',
        })
        .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:server']])
        .withPrompts({
          baseName: 'jhipster',
          packageName: 'com.mycompany.myapp',
          packageFolder: 'com/mycompany/myapp',
          serviceDiscoveryType: NO_SERVICE_DISCOVERY,
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
          serverSideOptions: [],
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

  describe('caffeine', () => {
    before(done => {
      helpers
        .run(getGenerator('server'))
        .withOptions({
          ...DEFAULT_TEST_OPTIONS,
          blueprint: 'myblueprint',
        })
        .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:server']])
        .withPrompts({
          baseName: 'jhipster',
          packageName: 'com.mycompany.myapp',
          packageFolder: 'com/mycompany/myapp',
          serviceDiscoveryType: NO_SERVICE_DISCOVERY,
          authenticationType: 'jwt',
          cacheProvider: 'caffeine',
          enableHibernateCache: true,
          databaseType: 'sql',
          devDatabaseType: 'h2Memory',
          prodDatabaseType: 'mysql',
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['fr'],
          buildTool: 'maven',
          rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
          serverSideOptions: [],
        })
        .on('end', done);
    });

    it('Assert caffeine configuration has entry added', () => {
      assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`, 'createCache(cm, entry);');
    });

    it('Assert caffeine configuration has entity added', () => {
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
        .run(getGenerator('server'))
        .withOptions({
          ...DEFAULT_TEST_OPTIONS,
          blueprint: 'myblueprint',
        })
        .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:server']])
        .withPrompts({
          baseName: 'jhipster',
          packageName: 'com.mycompany.myapp',
          packageFolder: 'com/mycompany/myapp',
          serviceDiscoveryType: NO_SERVICE_DISCOVERY,
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
          serverSideOptions: [],
        })
        .on('end', done);
    });
  });

  describe('redis', () => {
    before(done => {
      helpers
        .run(getGenerator('server'))
        .withOptions({
          ...DEFAULT_TEST_OPTIONS,
          blueprint: 'myblueprint',
        })
        .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:server']])
        .withPrompts({
          baseName: 'jhipster',
          packageName: 'com.mycompany.myapp',
          packageFolder: 'com/mycompany/myapp',
          serviceDiscoveryType: NO_SERVICE_DISCOVERY,
          authenticationType: 'jwt',
          cacheProvider: 'redis',
          enableHibernateCache: true,
          databaseType: 'sql',
          devDatabaseType: 'h2Memory',
          prodDatabaseType: 'mysql',
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['fr'],
          buildTool: 'maven',
          rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
          serverSideOptions: [],
        })
        .on('end', done);
    });

    it('Assert redis configuration has entry added', () => {
      assert.fileContent(
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
        'createCache(cm, entry, jcacheConfiguration);'
      );
    });

    it('Assert redis configuration has entity added', () => {
      assert.fileContent(
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
        'createCache(cm, com.mycompany.myapp.domain.Authority.class.getName(), jcacheConfiguration);'
      );
      assert.fileContent(
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
        'createCache(cm, com.mycompany.myapp.domain.entityClass.class.getName() + ".entitiesOneToMany", jcacheConfiguration);'
      );
      assert.fileContent(
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
        'createCache(cm, com.mycompany.myapp.domain.entityClass.class.getName() + ".entitiesManoToMany", jcacheConfiguration);'
      );
    });
  });
});
