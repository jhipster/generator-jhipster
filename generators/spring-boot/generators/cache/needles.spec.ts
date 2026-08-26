/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { before, describe, it } from 'esmocha';

import { asPostWritingTask } from '../../../base-application/support/task-type-inference.ts';
import { SERVER_MAIN_SRC_DIR } from '../../../generator-constants.ts';

import { defaultHelpers as helpers, result as runResult } from '#testing';

const GENERATOR_SPRING_CACHE = 'jhipster:spring-boot:cache';

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
        .withFiles({
          'src/test/java/com/mycompany/myapp/IntegrationTest.java': `
public @interface IntegrationTest {}
          `,
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
        .withFiles({
          'src/test/java/com/mycompany/myapp/IntegrationTest.java': `
public @interface IntegrationTest {}
          `,
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
        .withMockedSource({ except: ['addEntryToCache', 'addEntityToCache'] })
        .withFiles({
          'src/test/java/com/mycompany/myapp/IntegrationTest.java': `
public @interface IntegrationTest {}
          `,
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
