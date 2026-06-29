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

import path from 'node:path';

import { removeFieldsWithNullishValues } from '../../../lib/utils/index.ts';
import { GENERATOR_JHIPSTER } from '../../generator-constants.ts';

export type InfoFile = { filename: string; content: string; type: 'jdl' | 'yo-rc' | 'entity-jdl' | 'json' };

export type InfoData = {
  yoRcContent?: string;
  jdlDefinitions?: string;
  jdlApplications?: number;
  jdlEntitiesDefinitions?: string;
  yoRcBlank: boolean;
  yoRcValid?: boolean;
  files: InfoFile[];
  workspacesFolders?: string[];
};

export const filterData = ({ files, ...data }: InfoData): InfoData => {
  return {
    ...data,
    files: files.filter(
      file =>
        // Forbid any package.json file for security reasons.
        path.basename(file.filename).toLowerCase() !== 'package.json' &&
        (file.filename === '.yo-rc.json' || file.filename.endsWith('.jdl') || /\.jhipster\/\w+\.json$/.test(file.filename)),
    ),
  };
};

export const extractDataFromInfo = (info: string): InfoData => {
  const regexp = /<summary>(?<title>(?:(?!<\/summary>).)+)<\/summary>\s+<pre>(?<body>(?:(?!<\/pre>).)+)/gs;
  let yoRcContent: string | undefined;
  let jdlEntitiesDefinitions: string | undefined;
  let jdlDefinitions: string | undefined;
  let jdlApplications: number | undefined;
  let workspacesFolders: string[] | undefined;
  const files: InfoFile[] = [];

  for (const match of info.matchAll(regexp)) {
    const { title, body } = match.groups ?? {};
    if (title?.trim() && body?.trim()) {
      if (title.includes('.yo-rc.json file')) {
        if (title.includes(' for ')) {
          const folder = title.split(' for ')[1].trim();
          files.push({ filename: `${folder}/.yo-rc.json`, content: body.trim(), type: 'yo-rc' });
        } else {
          yoRcContent = body.trim();
          files.push({ filename: '.yo-rc.json', content: yoRcContent, type: 'yo-rc' });
        }
      } else if (title.includes(' file')) {
        files.push({ filename: title.split(' file')[0].trim(), content: body.trim(), type: 'json' });
      } else if (title.includes('JDL entity definitions')) {
        jdlEntitiesDefinitions = body.trim();
        files.push({ filename: 'entities.jdl', content: jdlEntitiesDefinitions, type: 'entity-jdl' });
      } else if (title.includes('JDL definitions')) {
        const applicationMatches = body.match(/application\s*\{/g) ?? [];
        if (applicationMatches.length > 0) {
          // JDL definitions can be a placeholder
          const jdlCount = files.filter(file => file.type === 'jdl').length;
          files.push({ filename: jdlCount === 0 ? 'app.jdl' : `app-${jdlCount}.jdl`, content: body.trim(), type: 'jdl' });
          jdlApplications ??= applicationMatches.length;
          jdlDefinitions ??= body.trim();
        }
      }
    }
  }

  let yoRcBlank = true;
  let yoRcValid: boolean | undefined;
  if (yoRcContent) {
    yoRcBlank = false;
    try {
      let content = JSON.parse(yoRcContent);
      content = GENERATOR_JHIPSTER in content ? content : { [GENERATOR_JHIPSTER]: content };
      workspacesFolders = content[GENERATOR_JHIPSTER].appsFolders;
      yoRcContent = JSON.stringify(content);
      yoRcValid = true;
    } catch (error) {
      yoRcValid = false;
      // eslint-disable-next-line no-console
      console.log('Invalid .yo-rc.json file', error);
    }
  }

  if (jdlDefinitions) {
    yoRcContent = undefined;
    jdlEntitiesDefinitions = undefined;
  }

  return filterData(
    removeFieldsWithNullishValues({
      yoRcContent,
      jdlEntitiesDefinitions,
      jdlDefinitions,
      yoRcBlank,
      yoRcValid,
      files,
      workspacesFolders,
      jdlApplications,
    }),
  );
};
