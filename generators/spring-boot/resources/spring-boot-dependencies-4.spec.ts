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
import { describe, expect, it } from 'expect-node';

import json from './spring-boot-dependencies-4.json' with { type: 'json' };
import springBootDependencies from './spring-boot-dependencies-4.ts';

describe('generator - spring-boot - spring-boot-dependencies-4', () => {
  const { versions, properties, modules } = springBootDependencies;
  const versionProperties = Object.entries(json.properties).filter(([property]) => property.endsWith('.version'));

  it('should store each managed version once, as a property', () => {
    expect(Object.keys(json)).toEqual(['artifactId', 'version', 'properties', 'modules']);
    expect(json.artifactId).toBe('spring-boot-dependencies');
  });

  it('should key the Spring Boot version by its artifactId', () => {
    expect(versions['spring-boot-dependencies']).toBe(json.version);
  });

  it('should derive the version of each version property, keyed without .version', () => {
    expect(versionProperties.length).toBeGreaterThan(100);
    expect(versions).toEqual({
      ...Object.fromEntries(versionProperties.map(([property, value]) => [property.slice(0, -'.version'.length), value])),
      'spring-boot-dependencies': json.version,
    });
  });

  it('should give the properties and the modules as they are stored', () => {
    expect(properties).toEqual(json.properties);
    expect(modules).toEqual(json.modules);
  });
});
