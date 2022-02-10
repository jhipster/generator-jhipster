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

const JDLApplicationConfigurationOption = require('./jdl-application-configuration-option');

module.exports = class StringJDLApplicationConfigurationOption extends JDLApplicationConfigurationOption {
  constructor(name, value, quoted = false) {
    super(name, value);
    this.quoted = quoted;
  }

  toString() {
    const value = this.quoted && !this.value.includes('"') ? `"${this.value}"` : this.value;
    return `${this.name} ${value}`;
  }
};
