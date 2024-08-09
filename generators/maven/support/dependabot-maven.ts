/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { XMLParser } from 'fast-xml-parser';
import { defaultXmlParserOptions } from '../internal/xml-store.js';

/**
 * Extract properties from pom content
 * @param pomContent
 */
export function getPomProperties(pomContent: string): Record<string, string> {
  return new XMLParser(defaultXmlParserOptions).parse(pomContent).project.properties;
}

export type MavenPom = {
  project: {
    artifactId: string;
    version: string;
    properties?: Record<string, string>;
  };
};

export type MavenPomAndVersions = {
  pomContent: MavenPom;
  versions: Record<string, string>;
};

/**
 * Extract version properties from pom content
 * @param fileContent
 */
export function parseMavenPom(fileContent: string): MavenPom {
  return new XMLParser(defaultXmlParserOptions).parse(fileContent);
}

/**
 * Extract version properties from pom content
 * @param pomContent
 */
export function getPomVersionProperties(pomContent: string | MavenPom): Record<string, string> {
  if (typeof pomContent === 'string') {
    pomContent = parseMavenPom(pomContent);
  }
  const { properties, version, artifactId } = pomContent.project;
  const versions = Object.fromEntries(
    Object.entries(properties ?? [])
      .filter(([property]) => property.endsWith('.version'))
      .map(([property, value]) => [property.slice(0, -8), value]),
  );
  if (version && artifactId) {
    versions[artifactId] = version;
  }
  return versions;
}
