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

const { CLIENT_MAIN_SRC_DIR } = constants;

module.exports = {
  writeFiles,
};

const commonFiles = {
  common: [
    {
      templates: ['.eslintignore', `${CLIENT_MAIN_SRC_DIR}manifest.webapp`],
    },
    {
      path: CLIENT_MAIN_SRC_DIR,
      templates: [
        { file: 'content/images/jhipster_family_member_0.svg', method: 'copy' },
        { file: 'content/images/jhipster_family_member_0_head-192.png', method: 'copy' },
        { file: 'content/images/jhipster_family_member_0_head-256.png', method: 'copy' },
        { file: 'content/images/jhipster_family_member_0_head-384.png', method: 'copy' },
        { file: 'content/images/jhipster_family_member_0_head-512.png', method: 'copy' },
        { file: 'content/images/jhipster_family_member_1.svg', method: 'copy' },
        { file: 'content/images/jhipster_family_member_1_head-192.png', method: 'copy' },
        { file: 'content/images/jhipster_family_member_1_head-256.png', method: 'copy' },
        { file: 'content/images/jhipster_family_member_1_head-384.png', method: 'copy' },
        { file: 'content/images/jhipster_family_member_1_head-512.png', method: 'copy' },
        { file: 'content/images/jhipster_family_member_2.svg', method: 'copy' },
        { file: 'content/images/jhipster_family_member_2_head-192.png', method: 'copy' },
        { file: 'content/images/jhipster_family_member_2_head-256.png', method: 'copy' },
        { file: 'content/images/jhipster_family_member_2_head-384.png', method: 'copy' },
        { file: 'content/images/jhipster_family_member_2_head-512.png', method: 'copy' },
        { file: 'content/images/jhipster_family_member_3.svg', method: 'copy' },
        { file: 'content/images/jhipster_family_member_3_head-192.png', method: 'copy' },
        { file: 'content/images/jhipster_family_member_3_head-256.png', method: 'copy' },
        { file: 'content/images/jhipster_family_member_3_head-384.png', method: 'copy' },
        { file: 'content/images/jhipster_family_member_3_head-512.png', method: 'copy' },
        { file: 'content/images/logo-jhipster.png', method: 'copy' },
        { file: 'favicon.ico', method: 'copy' },
        'content/css/loading.css',
        'WEB-INF/web.xml',
        'robots.txt',
        '404.html',
        'index.html',
      ],
    },
    {
      condition: generator => generator.enableI18nRTL,
      path: CLIENT_MAIN_SRC_DIR,
      templates: ['content/scss/rtl.scss'],
    },
  ],
  swagger: [
    {
      path: CLIENT_MAIN_SRC_DIR,
      templates: ['swagger-ui/index.html', { file: 'swagger-ui/dist/images/throbber.gif', method: 'copy' }],
    },
  ],
};

function writeFiles() {
  return this.writeFilesToDisk(commonFiles, 'common');
}
