import { before, describe, it } from 'esmocha';

import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.ts';
import { asPostWritingTask } from '../base-application/support/task-type-inference.ts';
import { SERVER_MAIN_SRC_DIR } from '../generator-constants.js';
import { GENERATOR_SPRING_CACHE } from '../generator-list.ts';

const addNeedlesTask = asPostWritingTask(function ({ source }) {
  source.addEntryToCache?.({ entry: 'entry' });
  source.addEntityToCache?.({
    entityAbsoluteClass: 'com.mycompany.myapp.domain.entityClass',
    relationships: [
      { collection: true, propertyName: 'entitiesOneToMany' },
      { collection: true, propertyName: 'entitiesManoToMany' },
    ],
  });
});

describe('needle API server cache: JHipster server generator with blueprint', () => {
  describe('ehcache', () => {
    before(async () => {
      await helpers
        .runJHipster(GENERATOR_SPRING_CACHE)
        .withJHipsterConfig({
          cacheProvider: 'ehcache',
          clientFramework: 'no',
          enableHibernateCache: true,
        })
        .withTask('postWriting', addNeedlesTask);
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
        .withJHipsterConfig({
          cacheProvider: 'caffeine',
          clientFramework: 'no',
          enableHibernateCache: true,
        })
        .withTask('postWriting', addNeedlesTask);
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
        .withJHipsterConfig({
          cacheProvider: 'redis',
          clientFramework: 'no',
          enableHibernateCache: true,
        })
        .withTask('postWriting', addNeedlesTask);
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
