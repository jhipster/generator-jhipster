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

import type { JavaArtifact } from '../java/types.js';

export type MavenArtifact = JavaArtifact & {
  version?: string;
  inProfile?: string;
};

export type MavenAnnotationProcessor = MavenArtifact;

export type MavenPlugin = MavenArtifact & {
  additionalContent?: string;
};

export type MavenRepository = {
  id: string;
  name?: string;
  url: string;
  releasesEnabled?: boolean;
  snapshotsEnabled?: boolean;
  inProfile?: string;
};

export type MavenDependency = MavenArtifact & {
  optional?: boolean;
  additionalContent?: string;
};

export type MavenDistributionManagement = {
  snapshotsId: string;
  snapshotsUrl: string;
  releasesId: string;
  releasesUrl: string;
  inProfile?: string;
};

export type MavenProperty = {
  property: string;
  value?: string | null;
  inProfile?: string;
};

export type MavenProfile = { id: string; content?: string };

export type MavenDefinition = {
  annotationProcessors?: MavenAnnotationProcessor[];
  dependencies?: MavenDependency[];
  dependencyManagement?: MavenDependency[];
  distributionManagement?: MavenDistributionManagement[];
  plugins?: MavenPlugin[];
  pluginManagement?: MavenPlugin[];
  pluginRepositories?: MavenRepository[];
  properties?: MavenProperty[];
  profiles?: MavenProfile[];
  repositories?: MavenRepository[];
};

export type MavenSourceType = {
  mergeMavenPomContent?(content: Record<string, any>): void;
  addMavenAnnotationProcessor?(artifact: MavenAnnotationProcessor | MavenAnnotationProcessor[]): void;
  addMavenDependency?(dependency: MavenDependency | MavenDependency[]): void;
  addMavenDependencyManagement?(dependency: MavenDependency | MavenDependency[]): void;
  addMavenDistributionManagement?(distributionManagement: MavenDistributionManagement | MavenDistributionManagement[]): void;
  addMavenPlugin?(plugin: MavenPlugin | MavenPlugin[]): void;
  addMavenPluginManagement?(plugin: MavenPlugin | MavenPlugin[]): void;
  addMavenPluginRepository?(repository: MavenRepository | MavenRepository[]): void;
  addMavenProperty?(property: MavenProperty | MavenProperty[]): void;
  addMavenProfile?(profile: MavenProfile | MavenProfile[]): void;
  addMavenRepository?(repository: MavenRepository | MavenRepository[]): void;
  addMavenDefinition?(definition: MavenDefinition): void;
};
