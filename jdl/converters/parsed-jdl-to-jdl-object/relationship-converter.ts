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

import _ from 'lodash';
import JDLRelationship from '../../models/jdl-relationship.js';
import { lowerFirst, upperFirst } from '../../utils/string-utils.js';
import { formatComment } from '../../utils/format-utils.js';

export default { convertRelationships };

/**
 * Converts parsed relationships to JDLRelationship objects.
 * @param {Array<Object>} parsedRelationships - the parsed relationships.
 * @param {Function} annotationToOptionConverter - the function that can convert annotations to options.
 * @param {Object} conversionOptions - conversion options
 * @param {Boolean} conversionOptions.unidirectionalRelationships - whether to generate bidirectional one-to-many.
 * @return the converted JDL relationships.
 */
export function convertRelationships(parsedRelationships, annotationToOptionConverter, conversionOptions: any = {}): JDLRelationship[] {
  if (!parsedRelationships) {
    throw new Error('Relationships have to be passed so as to be converted.');
  }
  const { unidirectionalRelationships } = conversionOptions;
  return parsedRelationships.map(parsedRelationship => {
    const relationshipConfiguration = {
      from: parsedRelationship.from.name,
      to: parsedRelationship.to.name,
      type: upperFirst(_.camelCase(parsedRelationship.cardinality)),
      injectedFieldInFrom: parsedRelationship.from.injectedField,
      injectedFieldInTo: parsedRelationship.to.injectedField,
      isInjectedFieldInFromRequired: parsedRelationship.from.required,
      isInjectedFieldInToRequired: parsedRelationship.to.required,
      commentInFrom: formatComment(parsedRelationship.from.javadoc),
      commentInTo: formatComment(parsedRelationship.to.javadoc),
      options: {
        global: annotationToOptionConverter.call(undefined, parsedRelationship.options.global),
        source: annotationToOptionConverter.call(undefined, parsedRelationship.options.source),
        destination: annotationToOptionConverter.call(undefined, parsedRelationship.options.destination),
      },
      unidirectionalRelationships,
    };
    if (!relationshipConfiguration.injectedFieldInFrom && !relationshipConfiguration.injectedFieldInTo) {
      relationshipConfiguration.injectedFieldInFrom = lowerFirst(relationshipConfiguration.to);
      relationshipConfiguration.injectedFieldInTo = lowerFirst(relationshipConfiguration.from);
    }
    return new JDLRelationship(relationshipConfiguration);
  });
}
