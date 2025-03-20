import { createNeedleCallback } from '../../base/support/needles.js';

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
      const beforeNeedleContent = beforeContent.substring(0, beforeNeedleContentIndex);
      let needleContent = beforeContent.substring(beforeNeedleContentIndex).slice(0, -needleValueSuffix.length);
      needleContent = needleContent.trim() ? needleContent : '';

      return `${beforeNeedleContent}${needleContent}${needleContent ? needleValueSeparator : ''}${enumValues.map(value => `${needleData.indentPrefix}${value}`).join(needleValueSeparator)}${needleValueSuffix}${afterContent}`;
    },
  });
