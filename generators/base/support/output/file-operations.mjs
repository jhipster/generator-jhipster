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
import shelljs from 'shelljs';
import { rmSync, statSync } from 'fs';

const deleteFile = (context, file) => {
  const destination = context.destinationPath(file);
  if (destination && shelljs.test('-f', destination)) {
    context.log(`Removing the file - ${destination}`);
    shelljs.rm(destination);
  }
  return destination;
};

const deleteFolder = (context, folder) => {
  folder = context.destinationPath(folder);
  try {
    if (statSync(folder).isDirectory()) {
      rmSync(folder, { recursive: true });
    }
  } catch (error) {
    context.log(`Could not remove folder ${folder}`);
  }
};

const moveWithGit = (context, from, to) => {
  const source = context.destinationPath(from);
  const dest = context.destinationPath(to);
  if (source && dest && shelljs.test('-f', source)) {
    context.info(`Renaming the file - ${source} to ${dest}`);
    return !shelljs.exec(`git mv -f ${source} ${dest}`).code;
  }
  return { source, dest };
};

export { deleteFile, deleteFolder, moveWithGit };
