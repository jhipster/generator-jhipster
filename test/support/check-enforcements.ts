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
import assert from 'assert';
import { opendirSync, readFileSync, writeFileSync } from 'fs';
import path, { basename } from 'path';
import { before, describe, it } from 'mocha';
import { getGeneratorFolder } from '../../lib/testing/get-generator.js';

const fixEnforcements = process.argv.includes('--fix-enforcements');

const readDir = dirPath => {
  const files: string[] = [];
  const dir = opendirSync(dirPath);
  let dirent = dir.readSync();
  while (dirent !== null) {
    const childPath = path.join(dirPath, dirent.name);
    if (dirent.isFile()) {
      files.push(childPath);
    } else {
      files.push(...readDir(childPath));
    }
    dirent = dir.readSync();
  }
  dir.closeSync();
  return files;
};

export default function checkEnforcements({ client }: { client?: boolean }, generator, ...generatorUsage: string[]) {
  describe('enforce some developments patterns', () => {
    const allFiles = readDir(getGeneratorFolder(generator));
    allFiles
      .filter(file => !/\.spec\.[mc]?[jt]s(.snap)?$/.test(file))
      .forEach(file => {
        describe(`file ${path.basename(file)}`, () => {
          let content;
          before(() => {
            content = readFileSync(file, 'utf-8');
          });

          [
            ['src/main/webapp', '<%= clientSrcDir %>'],
            ['src/test/javascript', '<%= clientTestDir %>'],
            ...(client
              ? [
                  [' jhiTranslate', ' <%= jhiPrefix %>Translate'],
                  [' Java ', ' <%= backendType %> '],
                ]
              : []),
          ].forEach(([notSpected, replacement]) => {
            const regex = new RegExp(notSpected, 'g');
            const regexSeparator = new RegExp(`${notSpected}/`, 'g');
            before(() => {
              if (!fixEnforcements || !replacement) return;
              if (file.endsWith('.ejs')) {
                if (regexSeparator.test(content)) {
                  writeFileSync(file, content.replace(regexSeparator, replacement));
                  content = readFileSync(file, 'utf-8');
                }
                if (regex.test(content)) {
                  writeFileSync(file, content.replace(regex, replacement));
                  content = readFileSync(file, 'utf-8');
                }
              }
            });
            it(`should not contain ${notSpected}`, () => {
              assert(!regex.test(content), `file ${file} should not contain ${notSpected}`);
            });
          });
        });
      });
    const templateFiles = allFiles.filter(file => file.endsWith('.ejs'));
    const jsFiles: string[] = [...allFiles, ...generatorUsage.map(gen => readDir(getGeneratorFolder(gen))).flat()]
      .filter(file => file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.ejs'))
      .sort((a, b) => {
        if (a.includes('files')) return -1;
        if (b.includes('files')) return 1;
        if (a.includes('generator.')) return -1;
        if (b.includes('generator.')) return 1;
        if (a.endsWith('.ejs')) return 1;
        if (b.endsWith('.ejs')) return -1;
        return 0;
      });
    templateFiles.forEach(templateFile => {
      const reference = basename(templateFile, '.ejs').replace('_reactive.java', '_').replace('_imperative.java', '_');
      it(`${templateFile} must have referenced with ${reference}`, () => {
        const found = jsFiles.find(jsFile => {
          const content = readFileSync(jsFile).toString();
          return content.includes(`/${reference}`) || content.includes(`'${reference}`);
        });
        if (!found) throw new Error(`File ${templateFile} is not referenced`);
      });
    });
  });
}
