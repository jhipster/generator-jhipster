/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { passthrough } from '@yeoman/transform';
import { Minimatch } from 'minimatch';
import CoreGenerator from '../../base-core/index.mjs';

type GetWebappTranslation = (s: string, data?: Record<string, any>) => string;

function replaceTranslationAttributes({ content, getWebappTranslation }: { content: string; getWebappTranslation: GetWebappTranslation }) {
  return content.replaceAll(/v-bind:(?<tag>(?:placeholder|title|label))="(?<translate>t\$\([^"]+\))"/g, (_complete, ...args) => {
    const groups: Record<string, string> = args.pop();
    if (groups.translate.includes('+')) {
      return '';
    }
    const translated = replaceTranslations({ content: groups.translate, type: 'vue', getWebappTranslation });
    return `${groups.tag}="${translated}"`;
  });
}

export function removeDeclarations({ content }: { content: string }) {
  return content
    .replaceAll(/\nimport {\s*useI18n\s*} from 'vue-i18n';/g, '')
    .replaceAll(/\n\s*t\$,/g, '')
    .replaceAll(/\n\s*t\$:\s*useI18n\(\).t,/g, '');
}

export function replaceTranslationTags(
  this: CoreGenerator | void,
  {
    body,
    enableTranslation,
    getWebappTranslation,
  }: {
    body: string;
    enableTranslation: boolean;
    getWebappTranslation: GetWebappTranslation;
  }
) {
  body = body.replaceAll(
    /(?<tagWithAttributes>(?<beforeTranslateTag><(?<tagName>a|b-(?:badge|link|button|alert)|button|div|h[1-9]|input|label|p|router-link|small|span|t[hd])(?:[^>]*)) v-(?:text|html)="(?<translate>t\$\([^)]*\))"(?<afterTranslateTag>(?:(?!\/?>)[^/>])*>))(?<tagContent>(?:(?!<\/\k<tagName>(?:>|\s|\n)).|\n)*)/g,
    (_complete, ...args) => {
      const groups: Record<string, string> = args.pop();
      if (new RegExp(`<${groups.tagName}[\\s>]`, 'g').test(groups.tagContent)) {
        throw new Error(`Nested tags identical to the translated tag are not supported: ${groups.tagWithAttributes}${groups.tagContent}`);
      }
      if (enableTranslation) {
        return groups.tagWithAttributes;
      }
      if (groups.translate) {
        if (groups.translate.includes('+')) {
          this?.log.info(`Ignoring dynamic translation ${groups.translate}`);
        } else {
          const translated = replaceTranslations({
            type: 'vue',
            content: groups.translate,
            getWebappTranslation,
          });
          if (translated !== groups.translate) {
            return `${groups.beforeTranslateTag}${groups.afterTranslateTag}${translated}`;
          }
          throw new Error(`${translated}, ${groups.translate}`);
        }
      }
      return `${groups.beforeTranslateTag}${groups.afterTranslateTag}${groups.tagContent}`;
    }
  );
  if (enableTranslation) {
    return body;
  }
  return replaceTranslationAttributes({ content: body, getWebappTranslation });
}

export function replaceTranslations({
  content,
  type,
  getWebappTranslation,
}: {
  content: string;
  type: 'vue' | 'ts';
  getWebappTranslation: GetWebappTranslation;
}) {
  const regex =
    type === 'ts'
      ? /(?:this.)?(t\$|i18n.t)\((?<key>[^),]*)(?:,\s*{(?<data>[^)]*)})?\)\.toString\(\)/g
      : /t\$\((?<key>[^),]*)(?:,\s*{(?<data>[^)]*)})?\)/g;
  return content.replaceAll(regex, (_complete, ...args) => {
    const groups: Record<string, string> = args.pop();
    const key = groups.key.substring(1, groups.key.length - 1).replaceAll("\\'", "'");
    let data;
    if (groups.data) {
      const interpolateMatches = groups.data.matchAll(/(?<field>[^{\s:,}]+)(?:\s*:\s*(?<value>[^,}]+))?/g);
      data = {};
      let templateLiteral = false;
      for (const interpolateMatch of interpolateMatches) {
        let { field, value }: { field?: string; value?: string | number } = interpolateMatch.groups || {};
        if (/^'.*'$/.test(field) || /^".*"$/.test(field)) {
          // unwrap field
          field = field.substring(1, field.length - 1);
        }
        if (value === undefined) {
          value = field;
        }
        value = value.trim();
        if (/^\d+$/.test(value)) {
          // convert integer
          value = parseInt(value, 10);
        } else if (/^'.*'$/.test(value) || /^".*"$/.test(value)) {
          // extract string value
          value = value.substring(1, value.length - 1);
        } else {
          // wrap expression
          if (type === 'vue') {
            value = `{{ ${value} }}`;
          } else {
            value = `\${${value}}`;
          }
          templateLiteral = true;
        }
        data[field] = value;
      }
      if (templateLiteral && type === 'ts') {
        return `\`${getWebappTranslation(key, data)}\``;
      }
    }
    if (type === 'vue') {
      return getWebappTranslation(key, data);
    }
    return `'${getWebappTranslation(key, data)}'`;
  });
}

const minimatch = new Minimatch('**/*.{vue,ts}');
export const isTranslatedVueFile = file => minimatch.match(file.path);

function translateVueFilesTransform(
  this: CoreGenerator | void,
  {
    enableTranslation,
    getWebappTranslation,
  }: {
    enableTranslation: boolean;
    getWebappTranslation: GetWebappTranslation;
  }
) {
  return passthrough(file => {
    let newContent;
    if (file.path.endsWith('.vue')) {
      newContent = replaceTranslationTags.call(this, { body: file.contents.toString(), enableTranslation, getWebappTranslation });
    } else if (!enableTranslation && file.path.endsWith('.ts')) {
      newContent = replaceTranslations({ type: 'ts', content: file.contents.toString(), getWebappTranslation });
      newContent = removeDeclarations({ content: newContent });
    }
    if (newContent) {
      if (!enableTranslation && newContent.includes('t$')) {
        throw new Error(`Could not translate ${file.path}:
${newContent}`);
      }
      file.contents = Buffer.from(newContent);
    }
  });
}

export default translateVueFilesTransform;
