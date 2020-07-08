/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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
const jhipsterUtils = require('generator-jhipster/generators/utils');
const constants = require('generator-jhipster/generators/generator-constants');
const chalk = require('chalk');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const CLIENT_WEBPACK_DIR = constants.CLIENT_WEBPACK_DIR;
const CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;

module.exports = {
    updateLanguagesInTranslationStore,
    updateI18nConfig,
    updateLanguagesInWebpack,
    replaceTranslation,
    addEntityToMenu,
    addEntityToRouterImport,
    addEntityToRouter,
    addEntityServiceToMainImport,
    addEntityServiceToMain,
    addPageToRouterImport,
    addPageToRouter,
    addPageServiceToMainImport,
    addPageServiceToMain,
    addPageProtractorConf
};

function updateLanguagesInTranslationStore(generator) {
    const fullPath = `${CLIENT_MAIN_SRC_DIR}app/shared/config/store/translation-store.ts`;
    try {
        let content = 'languages: {\n';
        if (generator.enableTranslation) {
            generator.generateLanguageOptions(generator.languages, generator.clientFramework).forEach((ln, i) => {
                content += `        ${ln}${i !== generator.languages.length - 1 ? ',' : ''}\n`;
            });
        }
        content += '        // jhipster-needle-i18n-language-key-pipe - JHipster will add/remove languages in this object\n      }';
        jhipsterUtils.replaceContent(
            {
                file: fullPath,
                pattern: /languages:.*\{([^\]]*jhipster-needle-i18n-language-key-pipe[^}]*)}/g,
                content
            },
            generator
        );
    } catch (e) {
        generator.log(
            chalk.yellow('\nUnable to find ')
            + fullPath
            + chalk.yellow(' or missing required jhipster-needle. Language pipe not updated with languages: ')
            + generator.languages
            + chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
        );
        generator.debug('Error:', e);
    }
}

function updateI18nConfig(generator) {
    const fullPath = `${CLIENT_MAIN_SRC_DIR}app/shared/config/config.ts`;

    try {
        // Add i18n config snippets for all languages
        let i18nConfig = 'const dateTimeFormats = {\n';
        if (generator.enableTranslation) {
            generator.languages.forEach((ln, i) => {
                i18nConfig += generateDateTimeFormat(ln, i, generator.languages.length);
            });
        }
        i18nConfig += '  // jhipster-needle-i18n-language-date-time-format - JHipster will add/remove format options in this object\n';
        i18nConfig += '}';

        jhipsterUtils.replaceContent(
            {
                file: fullPath,
                pattern: /const dateTimeFormats.*\{([^\]]*jhipster-needle-i18n-language-date-time-format[^}]*)}/g,
                content: i18nConfig
            },
            generator
        );
    } catch (e) {
        generator.log(
            chalk.yellow('\nUnable to find ')
            + fullPath
            + chalk.yellow(' or missing required jhipster-needle. Language pipe not updated with languages: ')
            + generator.languages
            + chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
        );
        generator.debug('Error:', e);
    }
}

function generateDateTimeFormat(language, index, length) {
    let config = `  '${language}': {\n`;

    config += '    short: {\n';
    config += '      year: \'numeric\', month: \'short\', day: \'numeric\', hour: \'numeric\', minute: \'numeric\'\n';
    config += '    },\n';
    config += '    medium: {\n';
    config += '      year: \'numeric\', month: \'short\', day: \'numeric\',\n';
    config += '      weekday: \'short\', hour: \'numeric\', minute: \'numeric\'\n';
    config += '    },\n';
    config += '    long: {\n';
    config += '      year: \'numeric\', month: \'long\', day: \'numeric\',\n';
    config += '      weekday: \'long\', hour: \'numeric\', minute: \'numeric\'\n';
    config += '    }\n';
    config += '  }';
    if (index !== length - 1) {
        config += ',';
    }
    config += '\n';
    return config;
}
function updateLanguagesInWebpack(generator) {
    const fullPath = `${CLIENT_WEBPACK_DIR}webpack.common.js`;
    try {
        let content = 'groupBy: [\n';
        generator.languages.forEach((language, i) => {
            content += `          { pattern: './src/main/webapp/i18n/${language}/*.json', fileName: './i18n/${language}.json' }${
                i !== generator.languages.length - 1 ? ',' : ''
            }\n`;
        });
        content += '          // jhipster-needle-i18n-language-webpack - JHipster will add/remove languages in this array\n'
            + '        ]';

        jhipsterUtils.replaceContent(
            {
                file: fullPath,
                pattern: /groupBy:.*\[([^\]]*jhipster-needle-i18n-language-webpack[^\]]*)\]/g,
                content
            },
            generator
        );
    } catch (e) {
        generator.log(
            chalk.yellow('\nUnable to find ')
                + fullPath
                + chalk.yellow(' or missing required jhipster-needle. Webpack language task not updated with languages: ')
                + generator.languages
                + chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
        );
        generator.debug('Error:', e);
    }
}

function replaceTranslation(generator, files) {
    for (let i = 0; i < files.length; i++) {
        const filePath = `${CLIENT_MAIN_SRC_DIR}${files[i]}`;
        // Match the below attributes and the $t() method
        const regexp = ['v-text', 'v-bind:placeholder', 'v-html', 'v-bind:title', 'v-bind:label', 'v-bind:value', 'v-bind:html']
            .map(s => `${s}="\\$t\\(.*?\\)"`)
            .join(')|(');
        jhipsterUtils.replaceContent(
            {
                file: filePath,
                pattern: new RegExp(` ?(${regexp})`, 'g'),
                content: ''
            },
            generator
        );
    }
}

function addEntityToMenu(generator, entityName, translationKey, className) {
    const menuI18nTitle = generator.enableTranslation ? `v-text="$t('global.menu.entities.${translationKey}')"` : '';
    jhipsterUtils.rewriteFile(
        {
            file: `${CLIENT_MAIN_SRC_DIR}/app/core/jhi-navbar/jhi-navbar.vue`,
            needle: 'jhipster-needle-add-entity-to-menu',
            splicable: [
                // prettier-ignore
                `<b-dropdown-item to="/${entityName}">
                        <font-awesome-icon icon="asterisk" />
                        <span ${menuI18nTitle}>${className}</span>
                    </b-dropdown-item>`
            ]
        },
        generator
    );
}

function addEntityToRouterImport(generator, entityAngularName, fileName, folderName) {
    if (!generator.readOnly) {
        jhipsterUtils.rewriteFile(
            {
                file: `${CLIENT_MAIN_SRC_DIR}/app/router/entities.ts`,
                needle: 'jhipster-needle-add-entity-to-router-import',
                splicable: [generator.stripMargin(
                    // prettier-ignore
                    `|// prettier-ignore
                    |const ${entityAngularName} = () => import('@/entities/${folderName}/${fileName}.vue');
                    |// prettier-ignore
                    |const ${entityAngularName}Update = () => import('@/entities/${folderName}/${fileName}-update.vue');
                    |// prettier-ignore
                    |const ${entityAngularName}Details = () => import('@/entities/${folderName}/${fileName}-details.vue');`
                )]
            },
            generator
        );
    } else {
        jhipsterUtils.rewriteFile(
            {
                file: `${CLIENT_MAIN_SRC_DIR}/app/router/entities.ts`,
                needle: 'jhipster-needle-add-entity-to-router-import',
                splicable: [generator.stripMargin(
                    // prettier-ignore
                    `|// prettier-ignore
                    |const ${entityAngularName} = () => import('@/entities/${folderName}/${fileName}.vue');
                    |// prettier-ignore
                    |const ${entityAngularName}Details = () => import('@/entities/${folderName}/${fileName}-details.vue');`
                )]
            },
            generator
        );
    }
}

function addEntityToRouter(generator, entityName, entityFileName, entityAngularName, firstEntityGenerate) {
    const comma = firstEntityGenerate ? '' : ',';
    if (!generator.readOnly) {
        jhipsterUtils.rewriteFile(
            {
                file: `${CLIENT_MAIN_SRC_DIR}/app/router/entities.ts`,
                needle: 'jhipster-needle-add-entity-to-router',
                splicable: [generator.stripMargin(
                    // prettier-ignore
                    `|${comma}
                        |    {
                        |      path: '/${entityFileName}',
                        |      name: '${entityAngularName}',
                        |      component: ${entityAngularName},
                        |      meta: { authorities: [Authority.USER] }
                        |    },
                        |    {
                        |      path: '/${entityFileName}/new',
                        |      name: '${entityAngularName}Create',
                        |      component: ${entityAngularName}Update,
                        |      meta: { authorities: [Authority.USER] }
                        |    },
                        |    {
                        |      path: '/${entityFileName}/:${entityName}Id/edit',
                        |      name: '${entityAngularName}Edit',
                        |      component: ${entityAngularName}Update,
                        |      meta: { authorities: [Authority.USER] }
                        |    },
                        |    {
                        |      path: '/${entityFileName}/:${entityName}Id/view',
                        |      name: '${entityAngularName}View',
                        |      component: ${entityAngularName}Details,
                        |      meta: { authorities: [Authority.USER] }
                        |    }`
                )]
            },
            generator
        );
    } else {
        jhipsterUtils.rewriteFile(
            {
                file: `${CLIENT_MAIN_SRC_DIR}/app/router/entities.ts`,
                needle: 'jhipster-needle-add-entity-to-router',
                splicable: [generator.stripMargin(
                    // prettier-ignore
                    `|${comma}
                        |    {
                        |      path: '/${entityFileName}',
                        |      name: '${entityAngularName}',
                        |      component: ${entityAngularName},
                        |      meta: { authorities: [Authority.USER] }
                        |    },
                        |    {
                        |      path: '/${entityFileName}/:${entityName}Id/view',
                        |      name: '${entityAngularName}View',
                        |      component: ${entityAngularName}Details,
                        |      meta: { authorities: [Authority.USER] }
                        |    }`
                )]
            },
            generator
        );
    }
}

function addEntityServiceToMainImport(generator, className, fileName, folderName) {
    jhipsterUtils.rewriteFile(
        {
            file: `${CLIENT_MAIN_SRC_DIR}/app/main.ts`,
            needle: 'jhipster-needle-add-entity-service-to-main-import',
            splicable: [generator.stripMargin(
                // prettier-ignore
                `|import ${className}Service from '@/entities/${folderName}/${fileName}.service';`
            )]
        },
        generator
    );
}

function addEntityServiceToMain(generator, entityName, className) {
    jhipsterUtils.rewriteFile(
        {
            file: `${CLIENT_MAIN_SRC_DIR}/app/main.ts`,
            needle: 'jhipster-needle-add-entity-service-to-main',
            splicable: [generator.stripMargin(
                // prettier-ignore
                `|    ${entityName}Service: () => new ${className}Service(),`
            )]
        },
        generator
    );
}

function addPageToRouterImport(generator, pageName, pageFolderName) {
    jhipsterUtils.rewriteFile(
        {
            file: `${CLIENT_MAIN_SRC_DIR}/app/router/pages.ts`,
            needle: 'jhipster-needle-add-entity-to-router-import',
            splicable: [generator.stripMargin(
                // prettier-ignore
                `|// prettier-ignore
                |const ${pageName} = () => import('@/pages/${pageFolderName}/${pageFolderName}.vue');`
            )]
        },
        generator
    );
}

function addPageToRouter(generator, pageName, pageFolderName) {
    jhipsterUtils.rewriteFile(
        {
            file: `${CLIENT_MAIN_SRC_DIR}/app/router/pages.ts`,
            needle: 'jhipster-needle-add-entity-to-router',
            splicable: [generator.stripMargin(
                // prettier-ignore
                `|
                |    {
                |      path: '/pages/${pageFolderName}',
                |      name: '${pageName}',
                |      component: ${pageName},
                |      meta: { authorities: [Authority.USER] }
                |    },`
            )]
        },
        generator
    );
}

function addPageServiceToMainImport(generator, pageName, pageFolderName) {
    jhipsterUtils.rewriteFile(
        {
            file: `${CLIENT_MAIN_SRC_DIR}/app/main.ts`,
            needle: 'jhipster-needle-add-entity-service-to-main-import',
            splicable: [generator.stripMargin(
                // prettier-ignore
                `|import ${pageName}Service from '@/pages/${pageFolderName}/${pageFolderName}.service';`
            )]
        },
        generator
    );
}

function addPageServiceToMain(generator, pageName, pageInstance) {
    jhipsterUtils.rewriteFile(
        {
            file: `${CLIENT_MAIN_SRC_DIR}/app/main.ts`,
            needle: 'jhipster-needle-add-entity-service-to-main',
            splicable: [generator.stripMargin(
                // prettier-ignore
                `|${pageInstance}Service: () => new ${pageName}Service(),`
            )]
        },
        generator
    );
}

function addPageProtractorConf(generator, pageFolderName) {
    jhipsterUtils.rewriteFile(
        {
            file: `${CLIENT_TEST_SRC_DIR}/protractor.conf.js`,
            needle: 'jhipster-needle-add-protractor-tests',
            splicable: [generator.stripMargin('\'./e2e/pages/**/*.spec.ts\',')]
        },
        generator
    );
}
