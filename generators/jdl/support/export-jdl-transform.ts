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

import { basename, join } from 'node:path';
import { Duplex } from 'node:stream';

import type { ConflicterFile } from '@yeoman/conflicter';
import { loadFile } from 'mem-fs';
import { setModifiedFileState } from 'mem-fs-editor/state';
import { Minimatch } from 'minimatch';

import { getJDLObjectFromSingleApplication } from '../../../lib/jdl/converters/json-to-jdl-converter.ts';
import { createRuntime } from '../../../lib/jdl/core/runtime.ts';
import type { JDLApplicationConfig } from '../../../lib/jdl/core/types/parsing.ts';
import type { Entity } from '../../../lib/jhipster/types/entity.ts';
import { GENERATOR_JHIPSTER } from '../../generator-constants.ts';

export const exportJDLTransform = ({
  destinationPath,
  jdlStorePath,
  throwOnMissingConfig = true,
  keepEntitiesConfig,
  jdlDefinition,
}: {
  destinationPath: string;
  jdlStorePath: string;
  throwOnMissingConfig?: boolean;
  keepEntitiesConfig?: boolean;
  jdlDefinition: JDLApplicationConfig;
}) =>
  Duplex.from(async function* (files: AsyncGenerator<ConflicterFile>) {
    const yoRcFilePath = join(destinationPath, '.yo-rc.json');
    const entitiesMatcher = new Minimatch(`${destinationPath}/.jhipster/*.json`);
    const entitiesFiles: ConflicterFile[] = [];
    const entitiesMap = new Map<string, Entity>();

    let yoRcFileInMemory: ConflicterFile | undefined;
    let jdlStoreFileInMemory: ConflicterFile | undefined;
    for await (const file of files) {
      if (file.path === yoRcFilePath) {
        yoRcFileInMemory = file;
      } else if (file.path === jdlStorePath) {
        jdlStoreFileInMemory = file;
      } else if (file.contents && entitiesMatcher.match(file.path)) {
        entitiesMap.set(basename(file.path).replace('.json', ''), JSON.parse(file.contents.toString()));
        entitiesFiles.push(file);
      } else {
        yield file;
      }
    }

    const yoRcFile = loadFile(yoRcFilePath) as ConflicterFile;
    const yoRcContents = yoRcFileInMemory?.contents ?? yoRcFile.contents;
    if (yoRcContents) {
      const contents = JSON.parse(yoRcContents.toString());
      if (contents[GENERATOR_JHIPSTER]?.jdlStore) {
        const { jdlStore, jwtSecretKey, rememberMeKey, jhipsterVersion, creationTimestamp, incrementalChangelog, ...rest } =
          contents[GENERATOR_JHIPSTER];

        const jdlObject = getJDLObjectFromSingleApplication(
          { ...contents, [GENERATOR_JHIPSTER]: { ...rest, incrementalChangelog } },
          createRuntime(jdlDefinition),
          entitiesMap,
        );

        const jdlContents = jdlObject.toString();

        const jdlStoreFile = jdlStoreFileInMemory ?? (loadFile(jdlStorePath) as ConflicterFile);
        jdlStoreFile.contents = Buffer.from(jdlContents);
        setModifiedFileState(jdlStoreFile);
        jdlStoreFile.conflicter = 'force';
        yield jdlStoreFile;

        yoRcFile.contents = Buffer.from(
          JSON.stringify({ [GENERATOR_JHIPSTER]: { jdlStore, jwtSecretKey, rememberMeKey, jhipsterVersion, creationTimestamp } }, null, 2),
        );
        setModifiedFileState(yoRcFile);
        yoRcFile.conflicter = 'force';
        yield yoRcFile;

        // Incremental changelog requires entities files to be kept for incremental change at next run
        if (keepEntitiesConfig || incrementalChangelog) {
          for (const file of entitiesFiles) {
            yield file;
          }
        }
      } else if (throwOnMissingConfig) {
        throw new Error(`File ${yoRcFilePath} is not a valid JHipster configuration file`);
      }
    } else if (throwOnMissingConfig) {
      throw new Error(`File ${yoRcFilePath} has no contents`);
    }
  });
