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
module.exports = {
  askProjectName,
  askBaseName,
  askPrettierDefaultIndent,
  askPrettierJavaIndent,
};
async function askProjectName() {
  if (this.abort) return;
  const defaultProjectName = this.getDefaultProjectName();
  const answer = await this.prompt({
    type: 'input',
    name: 'projectName',
    message: 'What is the project name of your application?',
    default: defaultProjectName,
  });
  this.projectName = answer.projectName;
}

async function askBaseName() {
  if (this.abort) return;
  const defaultAppBaseName = this.getDefaultAppName();
  const answer = await this.prompt({
    type: 'input',
    name: 'baseName',
    validate: input => {
      if (!/^([a-zA-Z0-9_]*)$/.test(input)) {
        return 'Your base name cannot contain special characters or a blank space';
      }
      if (/_/.test(input)) {
        return 'Your base name cannot contain underscores as this does not meet the URI spec';
      }
      if (input === 'application') {
        return "Your base name cannot be named 'application' as this is a reserved name for Spring Boot";
      }
      return true;
    },
    message: 'What is the base name of your application?',
    default: defaultAppBaseName,
  });
  this.baseName = answer.baseName;
}

async function askPrettierDefaultIndent() {
  if (this.abort) return;
  const prettierDefaultIndent = 2;
  const answer = await this.prompt({
    type: 'input',
    name: 'prettierDefaultIndent',
    message: 'What is the default indentation?',
    default: prettierDefaultIndent,
  });
  this.prettierDefaultIndent = answer.prettierDefaultIndent;
}

async function askPrettierJavaIndent() {
  if (this.abort) return;
  const prettierJavaIndent = 4;
  const answer = await this.prompt({
    type: 'input',
    name: 'prettierJavaIndent',
    message: 'What is the Java indentation?',
    default: prettierJavaIndent,
  });
  this.prettierJavaIndent = answer.prettierJavaIndent;
}
