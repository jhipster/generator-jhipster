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

const JDLField = require('../../models/jdl-field');
const { formatComment } = require('../../utils/format-utils');
const { lowerFirst } = require('../../utils/string-utils');

module.exports = { convertField };

/**
 * Converts a parsed JDL content corresponding to a field to a JDLField object.
 * @param {Object} field - a parsed JDL field.
 * @return {JDLField} the converted JDLField.
 */
function convertField(field) {
  if (!field) {
    throw new Error('A field has to be passed so as to be converted.');
  }
  const name = lowerFirst(field.name);
  const jdlField = new JDLField({
    name,
    type: field.type,
  });
  if (field.javadoc) {
    jdlField.comment = formatComment(field.javadoc);
  }
  return jdlField;
}
