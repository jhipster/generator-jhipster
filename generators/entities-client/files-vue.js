/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const constants = require('../generator-constants');
const { vueReplaceTranslation } = require('../utils');

const { VUE_DIR } = constants;

const vueFiles = {
  entities: [
    {
      path: VUE_DIR,
      templates: [
        'entities/entities.component.ts',
        'entities/entities.vue',
        'entities/entities-menu.component.ts',
        'entities/entities-menu.vue',
        'router/entities.ts',
      ],
    },
  ],
};

const writingTasks = {
  cleanup() {},

  async writeFiles() {
    if (!this.clientFrameworkVue) return;

    // write Vue files
    await this.writeFilesToDisk(vueFiles, 'vue');
  },
};

const postWritingTasks = {
  replaceTranslations() {
    if (this.clientFrameworkVue && !this.enableTranslation) {
      vueReplaceTranslation(this, ['app/entities/entities-menu.vue']);
    }
  },
};

module.exports = {
  writingTasks,
  postWritingTasks,
};
