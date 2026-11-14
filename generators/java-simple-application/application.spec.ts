/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { describe, expect, it } from 'esmocha';

import { createDelayedMutationContext, finalizeMutations, mutateData } from '../../lib/utils/object.ts';

import * as entityData from './application.ts';

import { mutateMockedCompleteData, mutateMockedData, prepareMutationTest } from '#testing';

describe('application mutation test', () => {
  for (const [name, data] of Object.entries(prepareMutationTest(entityData))) {
    it(`expects ${name} to match snapshot`, () => {
      expect(mutateMockedData(...data)).toMatchSnapshot({
        javaVersion: expect.any(String),
        jhipsterDependenciesVersion: expect.any(String),
        javaCompatibleVersions: expect.any(Array),
        graalvmReachabilityMetadata: expect.any(String),
      });
    });
    it(`expects ${name} to don't override existing properties`, () => {
      expect(Object.keys(mutateMockedCompleteData(...data))).toHaveLength(0);
    });
  }
});

describe('javaPackagingDestDir', () => {
  const { javaPackagingDestDir } = entityData.mutateApplicationPreparing;

  it('waits for a build tool a blueprint adds to set it', () => {
    const application = createDelayedMutationContext<any>();
    mutateData(application, { buildTool: 'custom', temporaryDir: 'out/' }, { javaPackagingDestDir });
    mutateData(application, { javaPackagingDestDir: 'out/dist/' });
    finalizeMutations(application);
    expect(application.javaPackagingDestDir).toBe('out/dist/');
  });

  it('is the folder of maven for a build tool a blueprint adds that does not set it', () => {
    const application = createDelayedMutationContext<any>();
    mutateData(application, { buildTool: 'custom', temporaryDir: 'out/' }, { javaPackagingDestDir });
    finalizeMutations(application);
    expect(application.javaPackagingDestDir).toBe('out/');
  });
});
