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
import { passthrough } from 'p-transform';
import { Minimatch } from 'minimatch';

const asTranslationAttribute = (s: string) => `(?:${s}="t\\$\\(.*?\\)")`;

const TRANSLATIONS_ATTRIBUTES = ['v-bind:placeholder', 'v-bind:title', 'v-bind:label', 'v-bind:value']
  .map(asTranslationAttribute)
  .join('|');

function removeTranslationAttributes(body: string) {
  return body.replace(new RegExp(`[\\s\\n]*(?:${TRANSLATIONS_ATTRIBUTES})`, 'g'), '');
}

function removeVTextTranslationAttributes(body: string) {
  return body.replaceAll(
    /(?<tagWithAttributes>(?<beforeTranslateTag><(?<tagName>input)(?:[^>]*)) v-(?:text|html)="t\$\((?<translate>[^)]*)\)"(?<afterTranslateTag>[^>]*\/>))/g,
    (_complete, ...args) => {
      const groups: Record<string, string> = args.pop();
      return `${groups.beforeTranslateTag}${groups.afterTranslateTag}`;
    }
  );
}

export function replaceTranslationTags({ body, enableTranslation }: { body: string; enableTranslation: boolean }) {
  body = body.replaceAll(
    /(?<tagWithAttributes>(?<beforeTranslateTag><(?<tagName>a|b-(?:badge|link|button|alert)|button|div|h[1-9]|input|label|p|router-link|small|span|t[hd])(?:[^>]*)) v-(?:text|html)="t\$\((?<translate>[^)]*)\)"(?<afterTranslateTag>(?:(?!\/?>)[^/>])*>))(?<tagContent>(?:(?!<\/\k<tagName>(?:>|\s|\n)).|\n)+)/g,
    (_complete, ...args) => {
      const groups: Record<string, string> = args.pop();
      if (new RegExp(`<${groups.tagName}[\\s>]`, 'g').test(groups.tagContent)) {
        throw new Error(`Nested tags identical to the translated tag are not supported: ${groups.tagWithAttributes}${groups.tagContent}`);
      }
      if (enableTranslation) {
        return groups.tagWithAttributes;
      }
      return `${groups.beforeTranslateTag}${groups.afterTranslateTag}${groups.tagContent}`;
    }
  );
  if (enableTranslation) {
    return body;
  }
  return removeVTextTranslationAttributes(removeTranslationAttributes(body));
}

const minimatch = new Minimatch('**/*.vue');
export const isTranslatedVueFile = file => minimatch.match(file.path);

const translateVueFilesTransform = ({
  enableTranslation,
  getWebappTranslation: _getWebappTranslation,
}: {
  enableTranslation: boolean;
  getWebappTranslation: any;
}) => {
  return passthrough(file => {
    file.contents = Buffer.from(replaceTranslationTags({ body: file.contents.toString(), enableTranslation }));
  }, 'jhipster:translate-vue-files');
};

export default translateVueFilesTransform;
