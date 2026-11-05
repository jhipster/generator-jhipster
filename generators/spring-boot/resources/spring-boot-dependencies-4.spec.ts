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
  const { versions } = springBootDependencies;

  it('should key the Spring Boot version by artifactId', () => {
    expect(json.artifactId).toBe('spring-boot-dependencies');
    expect(versions['spring-boot-dependencies']).toBe(json.version);
  });

  it('should derive a version for each version property', () => {
    const versionProperties = Object.entries(json.properties).filter(([property]) => property.endsWith('.version'));
    expect(versionProperties.length).toBeGreaterThan(0);
    for (const [property, value] of versionProperties) {
      expect(versions[property.slice(0, -'.version'.length)]).toBe(value);
    }
  });

  it('should not derive other versions', () => {
    expect(Object.keys(versions).toSorted()).toEqual(
      [
        json.artifactId,
        ...Object.keys(json.properties)
          .filter(property => property.endsWith('.version'))
          .map(property => property.slice(0, -'.version'.length)),
      ].toSorted(),
    );
  });
});
