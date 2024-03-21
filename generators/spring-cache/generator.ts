/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import BaseApplicationGenerator from '../base-application/index.js';
import { GENERATOR_SPRING_CACHE, GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.js';
import writeTask from './files.js';
import cleanupTask from './cleanup.js';
import { createNeedleCallback } from '../base/support/needles.js';
import { getCacheProviderMavenDefinition } from './internal/dependencies.js';
import { JavaDependency, JavaDependencyVersion } from '../java/types.js';

export default class SpringCacheGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_SPRING_CACHE);
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      loadDependabot({ application }) {
        this.loadJavaDependenciesFromGradleCatalog(application.javaDependencies!, true);
      },
      addNeedles({ source, application }) {
        if (
          (application as any).cacheProviderEhcache ||
          (application as any).cacheProviderCaffeine ||
          (application as any).cacheProviderRedis
        ) {
          const cacheConfigurationFile = `${application.javaPackageSrcDir}config/CacheConfiguration.java`;
          const needle = `${(application as any).cacheProvider}-add-entry`;
          const useJcacheConfiguration = (application as any).cacheProviderRedis;
          const addEntryToCacheCallback = entry =>
            createNeedleCallback({
              needle,
              contentToAdd: `createCache(cm, ${entry}${useJcacheConfiguration ? ', jcacheConfiguration' : ''});`,
            });

          source.addEntryToCache = ({ entry }) => this.editFile(cacheConfigurationFile, addEntryToCacheCallback(entry));
          source.addEntityToCache = ({ entityAbsoluteClass, relationships }) => {
            const entry = `${entityAbsoluteClass}.class.getName()`;
            this.editFile(
              cacheConfigurationFile,
              addEntryToCacheCallback(entry),
              ...(relationships ?? [])
                .filter(rel => rel.collection)
                .map(rel => addEntryToCacheCallback(`${entry} + ".${rel.propertyName}"`)),
            );
          };
        } else {
          // Add noop
          source.addEntryToCache = () => {};
          // Add noop
          source.addEntityToCache = () => {};
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanupTask,
      writeTask,
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addTestSpringFactory({ source, application }) {
        if ((application as any).cacheProviderRedis) {
          source.addTestSpringFactory?.({
            key: 'org.springframework.test.context.ContextCustomizerFactory',
            value: `${application.packageName}.config.RedisTestContainersSpringContextCustomizerFactory`,
          });
        }
      },
      applyGradleScript({ source, application }) {
        if (application.buildToolGradle) {
          const applicationAny = application as any;
          if (applicationAny.cacheProviderCaffeine) {
            source.addGradleDependencyCatalogVersion?.({ name: 'typesafe', version: application.javaDependencies?.typesafe });
            source.addGradleBuildSrcDependencyCatalogVersion?.({ name: 'typesafe', version: application.javaDependencies?.typesafe });
          }
          if (applicationAny.cacheProviderHazelcast) {
            source.addGradleDependencyCatalogVersion?.({
              name: 'hazelcast-spring',
              version: application.javaDependencies?.['hazelcast-spring'],
            });
            source.addGradleBuildSrcDependencyCatalogVersion?.({
              name: 'hazelcast-spring',
              version: application.javaDependencies?.['hazelcast-spring'],
            });
            if (applicationAny.enableHibernateCache) {
              source.addGradleDependencyCatalogVersion?.({
                name: 'hazelcast-hibernate53',
                version: application.javaDependencies?.['hazelcast-hibernate53'],
              });
              source.addGradleBuildSrcDependencyCatalogVersion?.({
                name: 'hazelcast-hibernate53',
                version: application.javaDependencies?.['hazelcast-hibernate53'],
              });
            }
          }
          source.addGradlePlugin?.({ id: 'jhipster.spring-cache-conventions' });
        }
      },
      addDependencies({ application, source }) {
        if (!application.javaDependencies) {
          throw new Error('Some application fields are be mandatory');
        }
        const { javaDependencies } = application;
        const { cacheProvider, enableHibernateCache } = application as any;

        const dependencies: JavaDependency[] = [{ groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-cache' }];
        const versions: JavaDependencyVersion[] = [];
        const definition = getCacheProviderMavenDefinition(cacheProvider, javaDependencies);
        versions.push(...(definition.base.versions ?? []));
        dependencies.push(...definition.base.dependencies!);
        if (enableHibernateCache && definition.hibernateCache) {
          versions.push(...(definition.hibernateCache.versions ?? []));
          dependencies.push(...definition.hibernateCache.dependencies!);
        }
        source.addJavaDefinition?.(
          { dependencies, versions },
          { gradleFile: 'buildSrc/src/main/groovy/jhipster.spring-cache-conventions.gradle' },
        );
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup(this.delegateTasksToBlueprint(() => this.postWriting));
  }

  get postWritingEntities() {
    return this.asPostWritingEntitiesTaskGroup({
      customizeFiles({ application, entities, source }) {
        if (application.databaseTypeSql) {
          for (const entity of entities.filter(entity => !entity.skipServer && !entity.builtInUser)) {
            source.addEntityToCache?.({
              entityAbsoluteClass: (entity as any).entityAbsoluteClass,
              relationships: entity.relationships,
            });
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.asPostWritingEntitiesTaskGroup(this.delegateTasksToBlueprint(() => this.postWritingEntities));
  }
}
