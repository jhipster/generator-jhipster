/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import type { JavaDependency, JavaDependencyVersion } from '../../java/types.ts';

const javaxCacheApi = {
  groupId: 'javax.cache',
  artifactId: 'cache-api',
};
const hibernateJCache = {
  groupId: 'org.hibernate.orm',
  artifactId: 'hibernate-jcache',
};

type CacheProviderDefinition = { versions?: JavaDependencyVersion[]; dependencies: JavaDependency[] };

type CacheProviderDependencies = {
  base: CacheProviderDefinition;
  hibernateCache?: CacheProviderDefinition;
};

export const getCacheProviderMavenDefinition: (
  cacheProvider: string,
  javaDependencies: Record<string, string>,
) => CacheProviderDependencies = (cacheProvider: string, javaDependencies: Record<string, string>) => {
  const dependenciesForCache: Record<string, CacheProviderDependencies> = {
    redis: {
      base: {
        dependencies: [
          {
            groupId: 'org.testcontainers',
            artifactId: 'junit-jupiter',
            scope: 'test',
          },
          {
            groupId: 'org.testcontainers',
            artifactId: 'testcontainers',
            scope: 'test',
          },
          {
            groupId: 'org.redisson',
            artifactId: 'redisson',
            version: javaDependencies.redisson,
          },
        ],
      },
      hibernateCache: {
        dependencies: [hibernateJCache],
      },
    },
    ehcache: {
      base: {
        dependencies: [
          javaxCacheApi,
          {
            groupId: 'org.ehcache',
            artifactId: 'ehcache',
            classifier: 'jakarta',
          },
        ],
      },
      hibernateCache: {
        dependencies: [hibernateJCache],
      },
    },
    caffeine: {
      base: {
        dependencies: [
          javaxCacheApi,
          {
            groupId: 'com.github.ben-manes.caffeine',
            artifactId: 'jcache',
          },
          {
            groupId: 'com.github.ben-manes.caffeine',
            artifactId: 'caffeine',
          },
          {
            groupId: 'com.typesafe',
            artifactId: 'config',
            version: javaDependencies.typesafe,
          },
        ],
      },
      hibernateCache: {
        dependencies: [hibernateJCache],
      },
    },
    hazelcast: {
      base: {
        dependencies: [
          javaxCacheApi,
          {
            groupId: 'com.hazelcast',
            artifactId: 'hazelcast-spring',
            version: javaDependencies['hazelcast-spring'],
          },
        ],
      },
      hibernateCache: {
        dependencies: [
          {
            groupId: 'com.hazelcast',
            artifactId: 'hazelcast-hibernate53',
            version: javaDependencies['hazelcast-hibernate53'],
          },
        ],
      },
    },
    infinispan: {
      base: {
        dependencies: [
          javaxCacheApi,
          {
            groupId: 'org.infinispan',
            artifactId: 'infinispan-hibernate-cache-v62',
          },
          {
            groupId: 'org.infinispan',
            artifactId: 'infinispan-spring-boot3-starter-embedded',
          },
          {
            groupId: 'org.infinispan',
            artifactId: 'infinispan-commons',
          },
          {
            groupId: 'org.infinispan',
            artifactId: 'infinispan-core',
          },
          {
            groupId: 'org.infinispan',
            artifactId: 'infinispan-component-annotations',
            scope: 'compile',
          },
        ],
      },
    },
    memcached: {
      base: {
        versions: [{ name: 'xmemcached-provider', version: javaDependencies['xmemcached-provider'] }],
        dependencies: [
          javaxCacheApi,
          {
            groupId: 'com.google.code.simple-spring-memcached',
            artifactId: 'spring-cache',
            versionRef: 'xmemcached-provider',
          },
          {
            groupId: 'com.google.code.simple-spring-memcached',
            artifactId: 'xmemcached-provider',
            versionRef: 'xmemcached-provider',
          },
          {
            groupId: 'com.googlecode.xmemcached',
            artifactId: 'xmemcached',
            version: javaDependencies.xmemcached,
          },
        ],
      },
    },
  };
  return dependenciesForCache[cacheProvider];
};
