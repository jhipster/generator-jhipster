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

import path from 'path';
import _ from 'lodash';
import chalk from 'chalk';
import { SERVER_MAIN_SRC_DIR, OPENAPI_GENERATOR_CLI_VERSION, JACKSON_DATABIND_NULLABLE_VERSION } from '../generator-constants.mjs';
import { applicationOptions, buildToolTypes, applicationTypes, authenticationTypes } from '../../jdl/jhipster/index.mjs';

const { OptionNames } = applicationOptions;
const { GRADLE, MAVEN } = buildToolTypes;
const { GATEWAY, MICROSERVICE } = applicationTypes;
const { JWT, SESSION } = authenticationTypes;

const { REACTIVE } = OptionNames;

export function writeFiles() {
  return {
    addOpenAPIIgnoreFile() {
      const basePath = this.config.get(REACTIVE) ? 'java' : 'spring';
      this.copyTemplate(`${basePath}/.openapi-generator-ignore`, '.openapi-generator-ignore');
    },
  };
}

export function customizeFiles() {
  return {
    callOpenApiGenerator() {
      if (Object.keys(this.clientsToGenerate).length === 0) {
        this.log('No openapi client configured. Please run "jhipster openapi-client" to generate your first OpenAPI client.');
        return;
      }

      Object.keys(this.clientsToGenerate).forEach(cliName => {
        const baseCliPackage = `${this.packageName}.client.`;
        const cliPackage = `${baseCliPackage}${_.toLower(cliName)}`;
        const snakeCaseCliPackage = `${baseCliPackage}${_.snakeCase(cliName)}`;
        this.removeFolder(path.resolve(SERVER_MAIN_SRC_DIR, ...cliPackage.split('.')));
        this.removeFolder(path.resolve(SERVER_MAIN_SRC_DIR, ...snakeCaseCliPackage.split('.')));

        const inputSpec = this.clientsToGenerate[cliName].spec;
        const generatorName = this.clientsToGenerate[cliName].generatorName;

        const openApiCmd = ['openapi-generator-cli generate'];
        let openApiGeneratorName;
        let openApiGeneratorLibrary;
        const additionalParameters = [];

        if (generatorName === 'spring') {
          openApiGeneratorName = 'spring';
          openApiGeneratorLibrary = 'spring-cloud';

          additionalParameters.push('-p supportingFiles=ApiKeyRequestInterceptor.java');
        } else if (generatorName === 'java') {
          openApiGeneratorName = 'java';
          openApiGeneratorLibrary = 'webclient';

          additionalParameters.push('-p dateLibrary=java8');
        }
        this.log(chalk.green(`\n\nGenerating npm script for generating client code ${cliName} (${inputSpec})`));

        openApiCmd.push(
          `-g ${openApiGeneratorName}`,
          `-i ${inputSpec}`,
          `-p library=${openApiGeneratorLibrary}`,
          `-p apiPackage=${cliPackage}.api`,
          `-p modelPackage=${cliPackage}.model`,
          `-p basePackage=${this.packageName}.client`,
          `-p configPackage=${cliPackage}`,
          `-p title=${_.camelCase(cliName)}`,
          `-p artifactId=${_.camelCase(cliName)}`
        );

        openApiCmd.push(additionalParameters.join(','));
        openApiCmd.push('--skip-validate-spec');
        if (this.clientsToGenerate[cliName].useServiceDiscovery) {
          openApiCmd.push('--additional-properties ribbon=true');
        }
        this.packageJson.merge({
          scripts: {
            [`openapi-client:${cliName}`]: openApiCmd.join(' '),
          },
        });
      });
    },

    addBackendDependencies() {
      if (!_.map(this.clientsToGenerate, 'generatorName').includes('spring')) {
        return;
      }

      if (this.buildTool === MAVEN) {
        if (![MICROSERVICE, GATEWAY].includes(this.applicationType)) {
          let exclusions;
          if (this.authenticationType === SESSION) {
            exclusions = `
            <exclusions>
                <exclusion>
                    <groupId>org.springframework.cloud</groupId>
                    <artifactId>spring-cloud-starter-ribbon</artifactId>
                </exclusion>
            </exclusions>`;
          }
          this.addMavenDependency('org.springframework.cloud', 'spring-cloud-starter-openfeign', null, exclusions);
        }
        this.addMavenDependency('org.springframework.cloud', 'spring-cloud-starter-oauth2');
      } else if (this.buildTool === GRADLE) {
        if (![MICROSERVICE, GATEWAY].includes(this.applicationType)) {
          if (this.authenticationType === SESSION) {
            const content =
              "compile 'org.springframework.cloud:spring-cloud-starter-openfeign', { exclude group: 'org.springframework.cloud', module: 'spring-cloud-starter-ribbon' }";
            this.rewriteFile('./build.gradle', 'jhipster-needle-gradle-dependency', content);
          } else {
            this.addGradleDependency('compile', 'org.springframework.cloud', 'spring-cloud-starter-openfeign');
          }
        }
        this.addGradleDependency('compile', 'org.springframework.cloud', 'spring-cloud-starter-oauth2');
      }
    },

    /* This is a hack to avoid non compiling generated code from openapi generator when the
     * enableSwaggerCodegen option is not selected (otherwise the jackson-databind-nullable dependency is already added).
     * Related to this issue https://github.com/OpenAPITools/openapi-generator/issues/2901 - remove this code when it's fixed.
     */
    addJacksonDataBindNullable() {
      if (!this.enableSwaggerCodegen) {
        if (this.buildTool === MAVEN) {
          this.addMavenProperty('jackson-databind-nullable.version', JACKSON_DATABIND_NULLABLE_VERSION);
          // eslint-disable-next-line no-template-curly-in-string
          this.addMavenDependency('org.openapitools', 'jackson-databind-nullable', '${jackson-databind-nullable.version}');
        } else if (this.buildTool === GRADLE) {
          this.addGradleProperty('jacksonDatabindNullableVersion', JACKSON_DATABIND_NULLABLE_VERSION);
          this.addGradleDependency(
            'compile',
            'org.openapitools',
            'jackson-databind-nullable',
            // eslint-disable-next-line no-template-curly-in-string
            '${jacksonDatabindNullableVersion}'
          );
        }
      }
    },

    enableFeignClients() {
      if (!_.map(this.clientsToGenerate, 'generatorName').includes('spring')) {
        return;
      }

      this.javaDir = `${SERVER_MAIN_SRC_DIR + this.packageFolder}/`;
      const mainClassFile = `${this.javaDir + this.getMainClassName()}.java`;

      if (this.applicationType !== MICROSERVICE || ![JWT].includes(this.authenticationType)) {
        this.rewriteFile(
          mainClassFile,
          'import org.springframework.core.env.Environment;',
          'import org.springframework.cloud.openfeign.EnableFeignClients;'
        );
        this.rewriteFile(mainClassFile, '@SpringBootApplication', '@EnableFeignClients');
      }
    },

    handleComponentScanExclusion() {
      if (!_.map(this.clientsToGenerate, 'generatorName').includes('spring')) {
        return;
      }

      this.javaDir = `${SERVER_MAIN_SRC_DIR + this.packageFolder}/`;
      const mainClassFile = `${this.javaDir + this.getMainClassName()}.java`;

      this.rewriteFile(
        mainClassFile,
        'import org.springframework.core.env.Environment;',
        'import org.springframework.context.annotation.ComponentScan;\nimport org.springframework.context.annotation.FilterType;'
      );

      const componentScan =
        '@ComponentScan( excludeFilters = {\n' +
        '   @ComponentScan.Filter(type = FilterType.REGEX, ' +
        `pattern = "${this.packageName}.client.*.ClientConfiguration")\n})`;
      this.rewriteFile(mainClassFile, '@SpringBootApplication', componentScan);
    },

    customizePackageJson() {
      this.packageJson.merge({
        dependencies: {
          '@openapitools/openapi-generator-cli': OPENAPI_GENERATOR_CLI_VERSION,
        },
      });
    },
  };
}
