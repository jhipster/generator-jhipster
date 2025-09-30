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
import assert from 'node:assert';

import type { WriteFileBlock, WriteFileSection } from '../api.ts';

export const convertWriteFileSectionsToBlocks = <DataType, Generator>(
  sections: WriteFileSection<DataType, Generator>,
): (WriteFileBlock<DataType, Generator> & { blockSpecPath: string })[] => {
  assert(typeof sections === 'object', 'sections must be an object');
  const parsedSections = Object.entries(sections)
    .map(([sectionName, sectionBlocks]) => {
      assert(Array.isArray(sectionBlocks), `Section must be an array for ${sectionName}`);
      return { sectionName, sectionBlocks };
    })
    .filter(({ sectionName }) => !sectionName.startsWith('_'));

  return parsedSections
    .map(({ sectionName, sectionBlocks }) => {
      return sectionBlocks.map((block, blockIdx) => {
        const blockSpecPath = `${sectionName}[${blockIdx}]`;
        assert(typeof block === 'object', `Block must be an object for ${blockSpecPath}`);
        return { blockSpecPath, ...block };
      });
    })
    .flat();
};
