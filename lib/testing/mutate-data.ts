/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project; see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License; Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing; software
 * distributed under the License is distributed on an "AS IS" BASIS;
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND; either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { type MutateDataParam, mutateData } from '../utils/object.ts';

export const mutateMockedData = (...mutations: MutateDataParam<any>[]) => {
  const data = {};
  const proxy = new Proxy(data, {
    get: (_target: any, p: string | symbol) => {
      return _target[p] === undefined ? p : _target[p];
    },
    set: (target: any, p: string | symbol, value: any) => {
      target[p] = value;
      return true;
    },
  });
  mutateData(proxy, ...mutations);
  return data;
};

export const mutateMockedCompleteData = (...mutations: MutateDataParam<any>[]) => {
  const data = {};
  const proxy = new Proxy(data, {
    get: (_target: any, p: string | symbol) => {
      return _target[p] === undefined ? p : _target[p];
    },
    set: (target: any, p: string | symbol, value: any) => {
      target[p] = value;
      return true;
    },
    has: (_target: any) => {
      return true;
    },
  });
  mutateData(proxy, ...mutations);
  return data;
};
