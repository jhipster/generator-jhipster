/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { asWriteFilesSection } from '../base-application/support/index.js';
import { LOCAL_BLUEPRINT_OPTION } from './constants.js';

export const files = asWriteFilesSection({
  baseFiles: [
    {
      condition: ctx => !ctx[LOCAL_BLUEPRINT_OPTION],
      templates: [
        '.github/workflows/generator.yml',
        '.prettierignore.jhi.blueprint',
        { sourceFile: 'eslint.config.js.jhi.blueprint', destinationFile: ctx => `${ctx.eslintConfigFile}.jhi.blueprint` },
        'README.md',
        'tsconfig.json',
        'vitest.config.ts',
        'vitest.test-setup.ts',
        '.blueprint/cli/commands.mjs',
        '.blueprint/generate-sample/command.mjs',
        '.blueprint/generate-sample/generator.mjs',
        '.blueprint/generate-sample/index.mjs',
      ],
    },
    {
      condition: ctx => !ctx[LOCAL_BLUEPRINT_OPTION] && ctx.githubWorkflows,
      templates: [
        '.blueprint/github-build-matrix/build-matrix.mjs',
        '.blueprint/github-build-matrix/generator.mjs',
        '.blueprint/github-build-matrix/index.mjs',
        '.github/workflows/build-cache.yml',
        '.github/workflows/samples.yml',
      ],
    },
    {
      condition: ctx => !ctx[LOCAL_BLUEPRINT_OPTION] && !ctx.sampleWritten,
      templates: ['.blueprint/generate-sample/templates/samples/sample.jdl'],
    },
    {
      condition: ctx => ctx.cli,
      templates: ['cli/cli.cjs'],
    },
    {
      condition: ctx => ctx.commands.length > 0,
      templates: ['cli/commands.cjs'],
    },
  ],
});

export const generatorFiles = {
  generator: [
    {
      path: 'generators/generator',
      to: ctx => `${ctx.application.blueprintsPath}${ctx.generator}`,
      templates: [
        { file: 'generator.mjs.jhi', renameTo: ctx => (ctx.js ? 'generator.js.jhi' : 'generator.mjs.jhi') },
        { file: 'index.mjs', renameTo: ctx => (ctx.js ? 'index.js' : 'index.mjs') },
      ],
    },
    {
      path: 'generators/generator',
      condition: ctx => ctx.priorities.find(priority => priority.name === 'initializing'),
      to: ctx => `${ctx.application.blueprintsPath}${ctx.generator}`,
      templates: [{ file: 'command.mjs', renameTo: ctx => (ctx.js ? 'command.js' : 'command.mjs') }],
    },
    {
      path: 'generators/generator',
      to: ctx => `${ctx.application.blueprintsPath}${ctx.generator}`,
      condition: ctx => !ctx.generator.startsWith('entity') && !ctx.application[LOCAL_BLUEPRINT_OPTION],
      templates: [
        {
          file: 'generator.spec.mjs',
          renameTo: ctx => (ctx.js ? 'generator.spec.js' : 'generator.spec.mjs'),
        },
      ],
    },
    {
      path: 'generators/generator',
      to: ctx => `${ctx.application.blueprintsPath}${ctx.generator}`,
      condition(ctx) {
        return (this.options.force || !ctx.written) && ctx.priorities.find(priority => priority.name === 'writing');
      },
      transform: false,
      templates: [
        {
          file: 'templates/template-file.ejs',
          renameTo: ctx => `templates/template-file-${ctx.generator}.ejs`,
        },
      ],
    },
  ],
};
