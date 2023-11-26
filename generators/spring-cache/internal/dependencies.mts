/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import { MavenDefinition } from '../../maven/types.mjs';

const javaxCacheApi = {
  groupId: 'javax.cache',
  artifactId: 'cache-api',
};
const hibernateJCache = {
  groupId: 'org.hibernate.orm',
  artifactId: 'hibernate-jcache',
  // TODO drop forced version. Refer to https://github.com/jhipster/generator-jhipster/issues/22579
  // eslint-disable-next-line no-template-curly-in-string
  version: '${hibernate.version}',
};

type CacheProviderDependencies = {
  base: MavenDefinition;
  hibernateCache?: MavenDefinition;
};

// eslint-disable-next-line import/prefer-default-export
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
        properties: [
          {
            property: 'typesafe.version',
            value: javaDependencies.typesafe,
          },
        ],
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
            // eslint-disable-next-line no-template-curly-in-string
            version: '${typesafe.version}',
          },
        ],
      },
      hibernateCache: {
        dependencies: [hibernateJCache],
      },
    },
    hazelcast: {
      base: {
        properties: [
          {
            property: 'hazelcast-spring.version',
            value: javaDependencies['hazelcast-spring'],
          },
        ],
        dependencies: [
          javaxCacheApi,
          {
            groupId: 'com.hazelcast',
            artifactId: 'hazelcast-spring',
            // eslint-disable-next-line no-template-curly-in-string
            version: '${hazelcast-spring.version}',
          },
        ],
      },
      hibernateCache: {
        properties: [
          {
            property: 'hazelcast-hibernate53.version',
            value: javaDependencies['hazelcast-hibernate53'],
          },
        ],
        dependencies: [
          {
            groupId: 'com.hazelcast',
            artifactId: 'hazelcast-hibernate53',
            // eslint-disable-next-line no-template-curly-in-string
            version: '${hazelcast-hibernate53.version}',
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
            artifactId: 'infinispan-commons-jakarta',
          },
          {
            groupId: 'org.infinispan',
            artifactId: 'infinispan-core-jakarta',
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
        dependencies: [
          javaxCacheApi,
          {
            groupId: 'com.google.code.simple-spring-memcached',
            artifactId: 'spring-cache',
          },
          {
            groupId: 'com.google.code.simple-spring-memcached',
            artifactId: 'xmemcached-provider',
          },
          {
            groupId: 'com.googlecode.xmemcached',
            artifactId: 'xmemcached',
          },
        ],
      },
    },
  };
  return dependenciesForCache[cacheProvider];
};
