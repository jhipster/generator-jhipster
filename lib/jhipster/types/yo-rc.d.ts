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
import type { GENERATOR_JHIPSTER } from '../../constants/jhipster.ts';
import type { YoRcConfigValue, YoRcFileContent } from '../../constants/yeoman.ts';

export type YoRcJHipsterApplicationConfigValue = {
  baseName?: string;
  entities?: string[];
  creationTimestamp?: number;
  blueprints?: { name: string }[];
  microfrontends?: { baseName: string }[];
};

export type YoRcJHipsterDeploymentConfigValue = {
  deploymentType?: string;
  appsFolders?: string[];
  clusteredDbApps?: string[];
};

export type YoRcJHipsterContent<Content extends YoRcConfigValue = YoRcConfigValue> = YoRcFileContent<Content, typeof GENERATOR_JHIPSTER>;

export type YoRcJHipsterApplicationContent<Content extends YoRcJHipsterApplicationConfigValue = YoRcJHipsterApplicationConfigValue> =
  YoRcFileContent<Content, typeof GENERATOR_JHIPSTER>;

export type YoRcJHipsterDeploymentContent<Content extends YoRcJHipsterDeploymentConfigValue = YoRcJHipsterDeploymentConfigValue> =
  YoRcFileContent<Content, typeof GENERATOR_JHIPSTER>;
