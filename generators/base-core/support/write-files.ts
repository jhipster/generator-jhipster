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
import type { EditFileCallback } from '../api.js';
import type CoreGenerator from '../generator.js';

/**
 * TODO move to utils when converted to typescripts
 * Converts multiples EditFileCallback callbacks into one.
 */

export function joinCallbacks<Generator extends CoreGenerator<any, any, any, any, any, any, any>>(
  ...callbacks: EditFileCallback<Generator>[]
): EditFileCallback<Generator> {
  // @ts-ignore
  return function (this: Generator, content: string, filePath: string) {
    for (const callback of callbacks) {
      content = callback.call(this, content, filePath);
    }
    return content;
  };
}
