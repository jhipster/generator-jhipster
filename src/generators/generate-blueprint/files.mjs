/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import { LOCAL_BLUEPRINT_OPTION } from './constants.mjs';

export const files = {
  baseFiles: [
    {
      condition: ctx => !ctx[LOCAL_BLUEPRINT_OPTION],
      templates: [
        '.github/workflows/generator.yml',
        '.eslintrc.json',
        '.mocharc.cjs',
        'README.md',
        'test/utils.mjs',
        '.prettierignore.jhi.blueprint',
      ],
    },
    {
      condition: ctx => ctx.cli,
      templates: [{ file: 'cli/cli.mjs', renameTo: ctx => (ctx.js ? 'cli/cli.js' : 'cli/cli.mjs') }],
    },
    {
      condition: ctx => ctx.commands.length > 0,
      templates: ['cli/commands.cjs'],
    },
  ],
};

export const generatorFiles = {
  generator: [
    {
      path: 'generators/generator',
      to: ctx => `${ctx.application.blueprintsPath}${ctx.generator}`,
      templates: [{ file: 'generator.mjs.jhi', renameTo: ctx => (ctx.js ? 'generator.js.jhi' : 'generator.mjs.jhi') }],
    },
    {
      path: 'generators/generator',
      to: ctx => `${ctx.application.blueprintsPath}${ctx.generator}`,
      templates: [{ file: 'index.mjs', renameTo: ctx => (ctx.js ? 'index.js' : 'index.mjs') }],
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
