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
import type { EditFileCallback } from '../api.ts';

/**
 * TODO move to utils when converted to typescripts
 * Converts multiples EditFileCallback callbacks into one.
 */

export function joinCallbacks<Generator>(...callbacks: EditFileCallback<Generator>[]): EditFileCallback<Generator> {
  return function (this: Generator, content: string, filePath: string) {
    for (const callback of callbacks) {
      content = callback.call(this, content, filePath);
    }
    return content;
  };
}

/**
 * Utility function add condition to every block in addition to the already existing condition.
 */
export function addSectionsCondition(files: Record<string, any[]>, commonCondition: (...args: any[]) => boolean) {
  return Object.fromEntries(
    Object.entries(files).map(([sectionName, sectionValue]) => {
      sectionValue = sectionValue.map(block => {
        const { condition } = block;
        let newCondition = commonCondition;
        if (typeof condition === 'function') {
          newCondition = (...args) => commonCondition(...args) && condition(...args);
        } else if (condition !== undefined) {
          newCondition = (...args) => commonCondition(...args) && condition;
        }
        block = {
          ...block,
          condition: newCondition,
        };
        return block;
      });
      return [sectionName, sectionValue];
    }),
  );
}

/**
 * Utility function to merge sections (jhipster files structure)
 * Merging { foo: [blocks1], bar: [block2]} and { foo: [blocks3], bar: [block4]}
 * Results in { foo: [blocks1, block3], bar: [block2, block4]}
 */
export function mergeSections(...allFiles: Record<string, any>[]): Record<string, any[]> {
  const generated: Record<string, any[]> = {};
  for (const files of allFiles) {
    for (const [sectionName, sectionValue] of Object.entries(files)) {
      generated[sectionName] = generated[sectionName] || [];
      generated[sectionName].push(...sectionValue);
    }
  }
  return generated;
}
