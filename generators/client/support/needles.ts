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
import { createNeedleCallback } from '../../base-core/support/needles.ts';

/**
 * Adds an item to a list, like a value of an array or an argument of a call, before each line of its needle, at the indentation
 * of the needle and followed by a comma. The item is not added again to a list that has it, the list starting at the line its
 * bracket opens.
 */
export const addListItem = ({ needle, item }: { needle: string; item: string }) => {
  const needleName = needle.startsWith('jhipster-needle-') ? needle : `jhipster-needle-${needle}`;
  const itemLine = new RegExp(String.raw`^\s*${item.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)},$`, 'm');
  return createNeedleCallback({
    needle: needleName,
    contentToAdd: content =>
      content.replaceAll(
        new RegExp(String.raw`^(\s*)(//\s*${needleName}\b.*)$`, 'gm'),
        (needleLine, indent: string, comment: string, offset: number) => {
          const before = content.slice(0, offset);
          const list = before.slice(Math.max(before.lastIndexOf('[\n'), before.lastIndexOf('(\n'), before.lastIndexOf('{\n')));
          return itemLine.test(list) ? needleLine : `${indent}${item},\n${indent}${comment}`;
        },
      ),
  });
};
