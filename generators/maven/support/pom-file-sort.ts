/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import type { X2jOptions, XmlBuilderOptions } from 'fast-xml-parser';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

import { defaultXmlBuildOptions, defaultXmlParserOptions } from '../internal/xml-store.js';
import { formatPomFirstLevel, sortPomProject } from '../internal/pom-sort.js';

type SortPomFileOptions = { xmlParserOptions?: Partial<X2jOptions>; xmlBuildOptions?: Partial<XmlBuilderOptions> };

export const sortPomFile = (pomFile: string, { xmlParserOptions, xmlBuildOptions }: SortPomFileOptions = {}): string => {
  const parser = new XMLParser({ ...defaultXmlParserOptions, ...xmlParserOptions });
  const pomObject = parser.parse(pomFile);
  pomObject.project = sortPomProject(pomObject.project);

  const builder = new XMLBuilder({ ...defaultXmlBuildOptions, ...xmlBuildOptions });
  return formatPomFirstLevel(builder.build(pomObject));
};
