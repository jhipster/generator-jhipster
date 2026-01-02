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
import BaseApplicationGenerator from '../base-application/index.ts';
import { createNeedleCallback } from '../base-core/support/needles.ts';
import type { Source as CommonSource } from '../common/types.ts';
import { GRADLE_BUILD_SRC_MAIN_DIR, SERVER_MAIN_SRC_DIR, SERVER_TEST_SRC_DIR } from '../generator-constants.ts';
import { moveToJavaPackageSrcDir, moveToJavaPackageTestDir } from '../java/support/files.ts';

import { getCacheProviderMavenDefinition } from './internal/dependencies.ts';
import type {
  Application as SpringCacheApplication,
  Config as SpringCacheConfig,
  Entity as SpringCacheEntity,
  Options as SpringCacheOptions,
  Source as SpringCacheSource,
} from './types.ts';

export default class SpringCacheGenerator extends BaseApplicationGenerator<
  SpringCacheEntity,
  SpringCacheApplication,
  SpringCacheConfig,
  SpringCacheOptions,
  SpringCacheSource
> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('spring-boot');
    }
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      configure() {
        const { databaseType, reactive, cacheProvider } = this.jhipsterConfigWithDefaults;
        if (this.jhipsterConfig.enableHibernateCache && (reactive || databaseType !== 'sql')) {
          this.log.verboseInfo(`Disabling hibernate cache for ${reactive ? 'reactive application' : 'non-SQL databases'}`);
          this.jhipsterConfig.enableHibernateCache = undefined;
        }
        if (reactive && cacheProvider !== 'no') {
          this.log.error(`Cache provider is not supported in reactive application`);
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      cancel() {
        if (this.jhipsterConfigWithDefaults.cacheProvider === 'no') {
          this.cancelCancellableTasks();
        }
      },
      loadDependabot({ application }) {
        this.loadJavaDependenciesFromGradleCatalog(application.javaDependencies!, true);
      },
      addNeedles({ source, application }) {
        if (application.cacheProviderEhcache || application.cacheProviderCaffeine || application.cacheProviderRedis) {
          const cacheConfigurationFile = `${application.javaPackageSrcDir}config/CacheConfiguration.java`;
          const needle = `${application.cacheProvider}-add-entry`;
          const useJcacheConfiguration = application.cacheProviderRedis;
          const addEntryToCacheCallback = (entry: string) =>
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
      async cleanup({ application, control }) {
        if (application.cacheProviderHazelcast) {
          if (control.isJhipsterVersionLessThan('3.12.0')) {
            this.removeFile(`${application.javaPackageSrcDir}config/hazelcast/HazelcastCacheRegionFactory.java`);
            this.removeFile(`${application.javaPackageSrcDir}config/hazelcast/package-info.java`);
          }
        }
        if (application.cacheProviderRedis) {
          if (control.isJhipsterVersionLessThan('7.8.2')) {
            this.removeFile(`${application.javaPackageTestDir}RedisTestContainerExtension.java`);
          }
        }
        if (application.buildToolGradle) {
          if (control.isJhipsterVersionLessThan('8.1.1')) {
            this.removeFile('gradle/cache.gradle');
          }
        }
        await control.cleanupFiles({
          '8.9.1': [[application.cacheProviderInfinispan!, `${application.javaPackageSrcDir}config/CacheFactoryConfiguration.java`]],
          '9.0.0-alpha.0': [`${GRADLE_BUILD_SRC_MAIN_DIR}/jhipster.spring-cache-conventions.gradle`],
        });
      },
      async writeTask({ application }) {
        const useModularedCacheConfiguration = application.cacheProviderInfinispan;
        await this.writeFiles({
          sections: {
            cacheFiles: [
              {
                path: `${SERVER_MAIN_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageSrcDir,
                templates: ['config/CacheKeyGeneratorConfiguration.java'],
              },
              {
                condition: () => !useModularedCacheConfiguration,
                path: `${SERVER_MAIN_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageSrcDir,
                templates: ['config/CacheConfiguration.java'],
              },
              {
                condition: () => useModularedCacheConfiguration,
                path: `${SERVER_MAIN_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageSrcDir,
                templates: [`config/CacheConfiguration_${application.cacheProvider}.java`],
              },
              {
                condition: () => application.cacheProviderRedis,
                path: `${SERVER_TEST_SRC_DIR}_package_/`,
                renameTo: moveToJavaPackageTestDir,
                templates: [
                  'config/EmbeddedRedis.java',
                  'config/RedisTestContainer.java',
                  'config/RedisTestContainersSpringContextCustomizerFactory.java',
                ],
              },
            ],
          },
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addTestSpringFactory({ source, application }) {
        if (application.cacheProviderRedis) {
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
        }
      },
      addDependencies({ application, source }) {
        if (!application.javaDependencies) {
          throw new Error('Some application fields are be mandatory');
        }
        const { javaDependencies, cacheProvider, enableHibernateCache } = application;

        const definition = getCacheProviderMavenDefinition(cacheProvider!, javaDependencies);
        source.addJavaDefinitions?.(
          {
            ...definition.base,
            dependencies: [
              { groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-cache' },
              ...definition.base.dependencies,
            ],
          },
          {
            condition: Boolean(enableHibernateCache && definition.hibernateCache),
            ...definition.hibernateCache,
          },
        );
      },
      sonar({ application, source }) {
        (source as CommonSource).ignoreSonarRule?.({
          ruleId: 'S1192',
          resourceKey: `${application.javaPackageSrcDir}config/CacheConfiguration.java`,
          ruleKey: 'java:S1192',
          comment: 'Rule https://rules.sonarsource.com/java/RSPEC-1192, there is no easy way to avoid this issue',
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get postWritingEntities() {
    return this.asPostWritingEntitiesTaskGroup({
      customizeFiles({ application, entities, source }) {
        if (application.databaseTypeSql) {
          for (const entity of entities.filter(entity => !entity.skipServer && !entity.builtInUser)) {
            source.addEntityToCache?.({
              entityAbsoluteClass: entity.entityAbsoluteClass,
              relationships: entity.relationships as any,
            });
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.postWritingEntities);
  }
}
