/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const _ = require('lodash');
const jhipsterUtils = require('generator-jhipster/generators/utils');
const constants = require('generator-jhipster/generators/generator-constants');


/* Constants use throughout */
const VUE_DIR = 'src/main/webapp/app/';

const CLIENT_VUE_TEMPLATES_DIR = 'vue';
const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

/**
* The default is to use a file path string. It implies use of the template method.
* For any other config an object { file:.., method:.., template:.. } can be used
*/

const vueFiles = {
    client: [
        {
            path: VUE_DIR,
            templates: [
                {
                    file: 'entities/entity-details.vue',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-details.vue`
                },
                {
                    file: 'entities/entity-update.vue',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}-update.vue`
                },
                {
                    file: 'entities/entity.vue',
                    renameTo: generator => `entities/${generator.entityFolderName}/${generator.entityFileName}.vue`
                }
            ]
        }
    ]
};


module.exports = {
    writeFiles,
    vueFiles
};

function writeFiles() {

  if (this.skipClient) return;

  // write client side files for VueJS
  this.writeFilesToDisk(vueFiles, this, false, this.fetchFromInstalledJHipster(`../../../../jhipster-vuejs/generators/entity-client/templates/${CLIENT_VUE_TEMPLATES_DIR}`));

  //Add entity to menu
  const className = this.entityClass;
  const entityName = this.entityInstance;
  entityMenuPath = `${CLIENT_MAIN_SRC_DIR}/app/components/JhipNavBar.vue`;
  jhipsterUtils.rewriteFile(
      {
          file: entityMenuPath,
          needle: 'jhipster-needle-add-entity-to-menu',
          splicable: [
              // prettier-ignore
              `<router-link to="${entityName}" tag="b-dropdown-item" class="dropdown-item" v-on:click="collapseNavbar()">
                    <font-awesome-icon icon="asterisk" />
                    <span v-text="$t('global.menu.entities.${entityName}')">${className}</span>
              </router-link>`
          ]
      },
      this
  );

  //Add entity paths to routing system
  routerPath = `${CLIENT_MAIN_SRC_DIR}/app/router/index.js`;
  jhipsterUtils.rewriteFile(
        {
            file: routerPath,
            needle: 'jhipster-needle-add-entity-to-router-import',
            splicable: [
                // prettier-ignore
                `
                import ${className} from '../entities/${entityName}/${className}'
                import ${className}Update from '../entities/${entityName}/${className}-update'
                import ${className}Details from '../entities/${entityName}/${className}-details'
                `
            ]
        },
        this
    );
  jhipsterUtils.rewriteFile(
      {
          file: routerPath,
          needle: 'jhipster-needle-add-entity-to-router',
          splicable: [
              // prettier-ignore
              `,{
                    path: '/${entityName}',
                    name: '${className}',
                    component: ${className}
              },{
                   path: '/${entityName}/new',
                   name: '${className}Edit',
                   component: ${className}Update
             },{
                   path: '/${entityName}/:${entityName}Id/edit',
                   name: '${className}Edit',
                   component: ${className}Update
             },{
                   path: '/${entityName}/:${entityName}Id/view',
                   name: '${className}View',
                   component: ${className}Details
             }
              `
          ]
      },
      this
  );
}
