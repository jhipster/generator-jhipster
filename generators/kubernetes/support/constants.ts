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
// Kubernetes versions
export const kubernetesConstants = {
  KUBERNETES_CORE_API_VERSION: 'v1',
  KUBERNETES_BATCH_API_VERSION: 'batch/v1',
  KUBERNETES_DEPLOYMENT_API_VERSION: 'apps/v1',
  KUBERNETES_STATEFULSET_API_VERSION: 'apps/v1',
  KUBERNETES_INGRESS_API_VERSION: 'networking.k8s.io/v1',
  KUBERNETES_ISTIO_NETWORKING_API_VERSION: 'networking.istio.io/v1beta1',
  KUBERNETES_RBAC_API_VERSION: 'rbac.authorization.k8s.io/v1',
} as const;

// Helm versions
export const helmConstants = {
  HELM_KAFKA: '^0.20.1',
  HELM_ELASTICSEARCH: '^1.32.0',
  HELM_PROMETHEUS: '^9.2.0',
  HELM_GRAFANA: '^4.0.0',
  HELM_MYSQL: '^1.4.0',
  HELM_MARIADB: '^6.12.2',
  HELM_POSTGRESQL: '^6.5.3',
  HELM_MONGODB_REPLICASET: '^3.10.1',
  HELM_COUCHBASE_OPERATOR: '^2.2.1',
} as const;
