import { basename, join } from 'path';
import { Duplex } from 'stream';
import { loadFile } from 'mem-fs';
import type { MemFsEditorFile } from 'mem-fs-editor';
import { Minimatch } from 'minimatch';
import { setModifiedFileState } from 'mem-fs-editor/state';
import { GENERATOR_JHIPSTER } from '../../generator-constants.js';
import { getJDLObjectFromSingleApplication } from '../../../lib/jdl/converters/json-to-jdl-converter.ts';
import { createRuntime } from '../../../lib/jdl/core/runtime.ts';
import type { JDLApplicationConfig } from '../../../lib/jdl/core/types/parsing.js';
import type { Entity } from '../../../lib/jhipster/types/entity.js';

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
  Duplex.from(async function* (files: AsyncGenerator<MemFsEditorFile>) {
    const yoRcFilePath = join(destinationPath, '.yo-rc.json');
    const entitiesMatcher = new Minimatch(`${destinationPath}/.jhipster/*.json`);
    const entitiesFiles: MemFsEditorFile[] = [];
    const entitiesMap = new Map<string, Entity>();

    let yoRcFileInMemory: MemFsEditorFile | undefined;
    let jdlStoreFileInMemory: MemFsEditorFile | undefined;

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

    const yoRcFile = loadFile(yoRcFilePath) as MemFsEditorFile;
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
          undefined,
        );

        const jdlContents = jdlObject.toString();

        const jdlStoreFile: MemFsEditorFile = jdlStoreFileInMemory ?? (loadFile(jdlStorePath) as any);
        jdlStoreFile.contents = Buffer.from(jdlContents);
        setModifiedFileState(jdlStoreFile);
        (jdlStoreFile as any).conflicter = 'force';
        yield jdlStoreFile;

        yoRcFile.contents = Buffer.from(
          JSON.stringify({ [GENERATOR_JHIPSTER]: { jdlStore, jwtSecretKey, rememberMeKey, jhipsterVersion, creationTimestamp } }, null, 2),
        );
        setModifiedFileState(yoRcFile);
        (yoRcFile as any).conflicter = 'force';
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
