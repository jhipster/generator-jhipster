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

export type MavenArtifact = {
  groupId: string;
  artifactId: string;
  version?: string;
  inProfile?: string;
};

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
  type?: string;
  scope?: string;
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

export type MavenSourceType = {
  addMavenAnnotationProcessor?(artifact: MavenArtifact): void;
  addMavenDependency?(dependecy: MavenDependency): void;
  addMavenDependencyManagement?(dependecy: MavenDependency): void;
  addMavenDistributionManagement?(distributionManagement: MavenDistributionManagement): void;
  addMavenPlugin?(plugin: MavenPlugin): void;
  addMavenPluginManagement?(plugin: MavenPlugin): void;
  addMavenPluginRepository?(repository: MavenRepository): void;
  addMavenProperty?(property: MavenProperty): void;
  addMavenProfile?(profile: MavenProfile): void;
  addMavenRepository?(repository: MavenRepository): void;
};
