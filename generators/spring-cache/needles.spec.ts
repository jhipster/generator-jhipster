import { before, describe, it } from 'esmocha';
import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.js';
import BaseApplicationGenerator from '../base-application/index.js';
import { SERVER_MAIN_SRC_DIR } from '../generator-constants.js';
import { GENERATOR_SPRING_CACHE } from '../generator-list.js';

const mockBlueprintSubGen: any = class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    this.sbsBlueprint = true;
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      addCacheEntries({ source }) {
        source.addEntryToCache?.({ entry: 'entry' });
        source.addEntityToCache?.({
          entityAbsoluteClass: 'com.mycompany.myapp.domain.entityClass',
          relationships: [
            { collection: true, propertyName: 'entitiesOneToMany' },
            { collection: true, propertyName: 'entitiesManoToMany' },
          ],
        });
      },
    });
  }
};

describe('needle API server cache: JHipster server generator with blueprint', () => {
  describe('ehcache', () => {
    before(async () => {
      await helpers
        .runJHipster(GENERATOR_SPRING_CACHE)
        .withOptions({
          blueprint: ['myblueprint'],
        })
        .withJHipsterConfig({
          cacheProvider: 'ehcache',
          clientFramework: 'no',
          enableHibernateCache: true,
        })
        .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:spring-cache' }]]);
    });

    it('Assert ehCache configuration has entry added', () => {
      runResult.assertFileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`, 'createCache(cm, entry);');
    });

    it('Assert ehCache configuration has entity added', () => {
      runResult.assertFileContent(
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
        'createCache(cm, com.mycompany.myapp.domain.entityClass.class.getName());',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
        'createCache(cm, com.mycompany.myapp.domain.entityClass.class.getName() + ".entitiesOneToMany");',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
        'createCache(cm, com.mycompany.myapp.domain.entityClass.class.getName() + ".entitiesManoToMany");',
      );
    });
  });

  describe('caffeine', () => {
    before(async () => {
      await helpers
        .runJHipster(GENERATOR_SPRING_CACHE)
        .withOptions({
          blueprint: ['myblueprint'],
        })
        .withJHipsterConfig({
          cacheProvider: 'caffeine',
          clientFramework: 'no',
          enableHibernateCache: true,
        })
        .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:spring-cache' }]]);
    });

    it('Assert caffeine configuration has entry added', () => {
      runResult.assertFileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`, 'createCache(cm, entry);');
    });

    it('Assert caffeine configuration has entity added', () => {
      runResult.assertFileContent(
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
        'createCache(cm, com.mycompany.myapp.domain.entityClass.class.getName());',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
        'createCache(cm, com.mycompany.myapp.domain.entityClass.class.getName() + ".entitiesOneToMany");',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
        'createCache(cm, com.mycompany.myapp.domain.entityClass.class.getName() + ".entitiesManoToMany");',
      );
    });
  });

  describe('redis', () => {
    before(async () => {
      await helpers
        .runJHipster(GENERATOR_SPRING_CACHE)
        .withOptions({
          blueprint: ['myblueprint'],
        })
        .withJHipsterConfig({
          cacheProvider: 'redis',
          clientFramework: 'no',
          enableHibernateCache: true,
        })
        .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:spring-cache' }]]);
    });

    it('Assert redis configuration has entry added', () => {
      runResult.assertFileContent(
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
        'createCache(cm, entry, jcacheConfiguration);',
      );
    });

    it('Assert redis configuration has entity added', () => {
      runResult.assertFileContent(
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
        'createCache(cm, com.mycompany.myapp.domain.entityClass.class.getName(), jcacheConfiguration);',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
        'createCache(cm, com.mycompany.myapp.domain.entityClass.class.getName() + ".entitiesOneToMany", jcacheConfiguration);',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.java`,
        'createCache(cm, com.mycompany.myapp.domain.entityClass.class.getName() + ".entitiesManoToMany", jcacheConfiguration);',
      );
    });
  });
});
