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

import type { JavaArtifactType } from '../types.ts';

export const javaScopeToGradleScope = (artifactType: JavaArtifactType): string => {
  const { scope = 'compile', type = 'jar' } = artifactType;
  if (type === 'pom') {
    if (scope === 'import') {
      return 'implementation platform';
    }
    throw new Error(`Unsupported scope for POM artifact: ${scope}`);
  }
  if (type === 'jar') {
    switch (scope) {
      case 'compile':
        return 'implementation';
      case 'provided':
        return 'compileOnly';
      case 'runtime':
        return 'runtimeOnly';
      case 'test':
        return 'testImplementation';
      case 'system':
      case 'annotationProcessor':
      case 'testRuntimeOnly':
        return scope;
      default:
        throw new Error(`Unsupported scope for JAR artifact: ${scope}`);
    }
  }
  throw new Error(`Unsupported type: ${type}`);
};
