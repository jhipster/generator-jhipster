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
/**
 * Spring Boot's managed versions, from the spring-boot-dependencies POM that update-spring-boot stores in spring-boot-dependencies-4.json.
 * The JSON holds each managed version once, as a property; `versions` is derived from it.
 */
import { getPomVersionProperties } from '../../java-simple-application/generators/maven/support/dependabot-maven.ts';

import springBootDependencies4 from './spring-boot-dependencies-4.json' with { type: 'json' };

const { artifactId, version, properties, modules } = springBootDependencies4;

export default {
  /** Spring Boot's managed versions, keyed by property name without the `.version` suffix, plus the Spring Boot version keyed by artifactId. */
  versions: getPomVersionProperties({ project: { artifactId, version, properties } }),
  properties,
  modules,
};
