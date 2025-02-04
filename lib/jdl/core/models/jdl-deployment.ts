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
import { applicationOptions, deploymentOptions } from '../built-in-options/index.js';
import { merge } from '../utils/object-utils.js';
import { join } from '../utils/set-utils.js';
import type { ParsedJDLDeployment } from '../types/parsed.js';

const { Options } = deploymentOptions;
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
        this[key] = new Set(option);
      } else if (key === applicationOptions.OptionNames.SERVICE_DISCOVERY_TYPE && option === Options.serviceDiscoveryType.no) {
        this[key] = 'no';
      } else {
        this[key] = option;
      }
    });
  }

  toString() {
    return stringifyConfig(this);
  }
}

function stringifyConfig(applicationConfig) {
  let config = 'deployment {';
  Object.entries(applicationConfig).forEach(([option, value]) => {
    if (!isEqual(defaults(applicationConfig.deploymentType)[option], value) || option === 'deploymentType') {
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
  return deploymentOptions.Options.defaults(deploymentType);
}
