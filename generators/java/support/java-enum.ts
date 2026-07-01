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

type EnumNeedleOptions = { enumName: string; enumValues: string[]; needle?: string; needleValuePrefix?: string };

export const createEnumNeedleCallback = ({
  enumName,
  enumValues,
  needle = 'add-item-to-enum',
  needleValuePrefix = `${enumName} {\n`,
}: EnumNeedleOptions) =>
  createNeedleCallback({
    needle,
    contentToAdd: (content, needleData) => {
      const needleValueSuffix = `;\n`;
      const needleValueSeparator = `,\n`;

      let beforeContent = content.slice(0, needleData.needleLineIndex);
      const afterContent = content.slice(needleData.needleLineIndex);
      // Drop extra line ending if it exists, can be caused by prettier formatting
      beforeContent = beforeContent.endsWith('/n/n') ? beforeContent.slice(0, -1) : beforeContent;
      if (!beforeContent.includes(needleValuePrefix) || !beforeContent.endsWith(needleValueSuffix)) {
        throw new Error(`Invalid file content ${beforeContent}, expected to contain ${needleValuePrefix}`);
      }
      const beforeNeedleContentIndex = beforeContent.lastIndexOf(needleValuePrefix) + needleValuePrefix.length;
      const beforeNeedleContent = beforeContent.slice(0, beforeNeedleContentIndex);
      let needleContent = beforeContent.slice(beforeNeedleContentIndex).slice(0, -needleValueSuffix.length);
      needleContent = needleContent.trim() ? needleContent : '';

      return `${beforeNeedleContent}${needleContent}${needleContent ? needleValueSeparator : ''}${enumValues.map(value => `${needleData.indentPrefix}${value}`).join(needleValueSeparator)}${needleValueSuffix}${afterContent}`;
    },
  });
