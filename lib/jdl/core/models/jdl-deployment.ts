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
import { isEqual } from 'lodash-es';

import deploymentOptions from '../../../jhipster/deployment-options.ts';
import type { ParsedJDLDeployment } from '../types/parsed.js';
import { merge } from '../utils/object-utils.ts';
import { join } from '../utils/set-utils.ts';

const arrayTypes = ['appsFolders', 'clusteredDbApps'];

export default class JDLDeployment {
  deploymentType!: string;
  appsFolders?: string[];
  directoryPath?: string;
  gatewayType?: string;
  kubernetesServiceType?: string;
  istio?: boolean;
  ingressDomain?: string;
  ingressType?: string;
  storageType?: string;
  monitoring?: string;
  clusteredDbApps?: string[];

  constructor(args: ParsedJDLDeployment) {
    if (!args?.deploymentType) {
      throw new Error('The deploymentType is mandatory to create a deployment.');
    }
    const merged = merge(defaults(args.deploymentType), args);
    Object.entries(merged).forEach(([key, option]) => {
      if (Array.isArray(option) && arrayTypes.includes(key)) {
        (this as any)[key] = new Set(option);
      } else {
        (this as any)[key] = option;
      }
    });
  }

  toString() {
    return stringifyConfig(this);
  }
}

function stringifyConfig(applicationConfig: Record<string, any>): string {
  let config = 'deployment {';
  const deploymentTypeDefaults: Record<string, any> = defaults(applicationConfig.deploymentType);
  Object.entries(applicationConfig).forEach(([option, value]) => {
    if (!isEqual(deploymentTypeDefaults[option], value) || option === 'deploymentType') {
      config = `${config}\n    ${option}${stringifyOptionValue(option, value)}`;
    }
  });
  return `${config}\n  }`;
}

function stringifyOptionValue(name: string, value: any): string {
  if (arrayTypes.includes(name)) {
    if (value.size === 0) {
      return ' []';
    }
    return ` [${join(value, ', ')}]`;
  }
  if (value === null || value === undefined) {
    return '';
  }
  return ` ${value}`;
}

function defaults(deploymentType: string) {
  return deploymentOptions.Options.defaults(deploymentType as any);
}
