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
import type { JDLSemanticRule } from '../jdl/core/parsing/semantic/types.ts';

export const deploymentType: JDLSemanticRule = {
  id: 'deployment-type',
  check: ast =>
    ast.deployments
      .filter(deployment => !deployment.deploymentType)
      .map(deployment => ({ message: 'The deploymentType is mandatory to create a deployment.', location: deployment.location })),
};

export const kubernetesIstioIngressDomain: JDLSemanticRule = {
  id: 'kubernetes-istio-ingress-domain',
  check: ast =>
    ast.deployments
      .filter(deployment => deployment.deploymentType === 'kubernetes' && deployment.istio === true && !deployment.ingressDomain)
      .map(deployment => ({
        message:
          'An ingress domain must be provided when dealing with kubernetes-related deployments, with istio and when the service type is ingress.',
        location: deployment.location,
      })),
};

/** The semantic rules of JHipster, checked with the ones of the jdl. */
export const jhipsterSemanticRules: readonly JDLSemanticRule[] = [deploymentType, kubernetesIstioIngressDomain];
