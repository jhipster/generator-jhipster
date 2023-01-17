/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

/**
 * @private
 */
const generateDateTimeFormat = (language, index, length) => {
  let config = `  '${language}': {\n`;

  config += '    short: {\n';
  config += "      year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'\n";
  config += '    },\n';
  config += '    medium: {\n';
  config += "      year: 'numeric', month: 'short', day: 'numeric',\n";
  config += "      weekday: 'short', hour: 'numeric', minute: 'numeric'\n";
  config += '    },\n';
  config += '    long: {\n';
  config += "      year: 'numeric', month: 'long', day: 'numeric',\n";
  config += "      weekday: 'long', hour: 'numeric', minute: 'numeric'\n";
  config += '    }\n';
  config += '  }';
  if (index !== length - 1) {
    config += ',';
  }
  config += '\n';
  return config;
};

export default generateDateTimeFormat;
