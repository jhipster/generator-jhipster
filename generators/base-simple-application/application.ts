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
import { kebabCase, upperFirst } from 'lodash-es';

import type { MutateDataParam, MutateDataPropertiesWithRequiredProperties } from '../../lib/utils/object.ts';
import packageJson from '../../package.json' with { type: 'json' };
import type { WriteContext } from '../base-core/api.ts';
import type { ProjectNameAddedApplicationProperties } from '../project-name/application.ts';

export type BaseSimpleApplicationAddedApplicationProperties = WriteContext & {
  jhipsterVersion: string;
  documentationArchiveUrl: string;

  jhiPrefix: string;
  jhiPrefixCapitalized: string;
  jhiPrefixDashed: string;

  hipsterName?: string;
  hipsterProductName?: string;
  hipsterHomePageProductName?: string;
  hipsterStackOverflowProductName?: string;
  hipsterBugTrackerProductName?: string;
  hipsterChatProductName?: string;
  hipsterTwitterUsername?: string;
  hipsterDocumentationLink?: string;
  hipsterTwitterLink?: string;
  hipsterProjectLink?: string;
  hipsterStackoverflowLink?: string;
  hipsterBugTrackerLink?: string;
  hipsterChatLink?: string;

  projectVersion?: string;
  projectDescription: string;

  jhipsterPackageJson: typeof packageJson;
};

export const mutateApplication = {
  __override__: false,

  jhipsterVersion: packageJson.version,
  jhiPrefix: 'jhi',
  jhiPrefixCapitalized: ({ jhiPrefix }) => upperFirst(jhiPrefix),
  jhiPrefixDashed: ({ jhiPrefix }) => kebabCase(jhiPrefix),

  customizeTemplatePaths: () => [],

  hipsterName: 'Java Hipster',
  hipsterProductName: 'JHipster',
  hipsterHomePageProductName: 'JHipster',
  hipsterStackOverflowProductName: 'JHipster',
  hipsterBugTrackerProductName: 'JHipster',
  hipsterChatProductName: 'JHipster',
  hipsterTwitterUsername: '@jhipster',
  hipsterDocumentationLink: 'https://www.jhipster.tech/',
  hipsterTwitterLink: 'https://twitter.com/jhipster',
  hipsterProjectLink: 'https://github.com/jhipster/generator-jhipster',
  hipsterStackoverflowLink: 'https://stackoverflow.com/tags/jhipster/info',
  hipsterBugTrackerLink: 'https://github.com/jhipster/generator-jhipster/issues?state=open',
  hipsterChatLink: 'https://gitter.im/jhipster/generator-jhipster',

  projectDescription: ({ projectDescription, humanizedBaseName }) => projectDescription ?? `Description for ${humanizedBaseName}`,
  documentationArchiveUrl: ({ hipsterDocumentationLink }) => `${hipsterDocumentationLink}`,

  jhipsterPackageJson: packageJson,
} as const satisfies MutateDataPropertiesWithRequiredProperties<
  MutateDataParam<ProjectNameAddedApplicationProperties & BaseSimpleApplicationAddedApplicationProperties>,
  BaseSimpleApplicationAddedApplicationProperties
>;
