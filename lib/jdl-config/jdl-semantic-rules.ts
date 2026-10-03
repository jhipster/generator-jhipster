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
import { APPLICATION_TYPE_MICROSERVICE } from '../core/application-types.ts';
import { type JDLApplicationStatement, type JDLSemanticRule, type JDLStatement, getStatements } from '../jdl/core/parsing/index.ts';

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

/**
 * The microservice the `microservice` statements give each entity, in the order they are written: `*`, or no entity,
 * stands for the entities passed but the excluded ones.
 */
function microserviceOwners(
  statements: (JDLStatement | JDLApplicationStatement)[],
  entityNames: string[],
  owners = new Map<string, string>(),
) {
  for (const statement of statements) {
    if (statement.type !== 'option' || statement.option.optionName !== 'microservice') continue;
    const { list, excluded = [], optionValue } = statement.option;
    const names = list.length === 0 || list.includes('*') ? entityNames.filter(name => !excluded.includes(name)) : list;
    for (const name of names) owners.set(name, optionValue!);
  }
  return owners;
}

export const microserviceEntity: JDLSemanticRule = {
  id: 'microservice-entity',
  check: ast => {
    const statements = getStatements<JDLStatement>(ast) ?? [];
    const jdlOwners = microserviceOwners(
      statements,
      ast.entities.map(entity => entity.name),
    );
    return ast.applications
      .filter(application => application.config.applicationType === APPLICATION_TYPE_MICROSERVICE)
      .flatMap(application => {
        const { baseName } = application.config;
        const applicationStatements = getStatements<JDLApplicationStatement>(application) ?? [];
        const owners = microserviceOwners(applicationStatements, application.entities ?? [], new Map(jdlOwners));
        const entitiesStatement = applicationStatements.find(statement => statement.type === 'entities');
        return (application.entities ?? [])
          .filter(name => owners.has(name) && owners.get(name)!.toLowerCase() !== baseName.toLowerCase())
          .map(name => ({
            message: `The entity ${name} of the microservice ${owners.get(name)} is in the entity list of the microservice ${baseName}.`,
            location: application.entitiesOptions?.keyLocations?.[name] ?? entitiesStatement?.location ?? application.location,
          }));
      });
  },
};

export const microfrontendClientFramework: JDLSemanticRule = {
  id: 'microfrontend-client-framework',
  check: ast =>
    ast.applications.flatMap(({ config, location }) => {
      const microfrontend = config.microfrontend === true;
      const servesMicrofrontends =
        config.applicationType === 'gateway' && ((config.microfrontends as string[] | undefined) ?? []).length > 0;
      if ((!microfrontend && !servesMicrofrontends) || (config.clientFramework !== undefined && config.clientFramework !== 'no')) {
        return [];
      }
      const name = config.baseName ? ` ${config.baseName}` : '';
      return [
        {
          message:
            microfrontend ?
              `The microfrontend${name} needs a client framework.`
            : `The gateway${name} serves microfrontends, and needs a client framework.`,
          location:
            config.keyLocations?.clientFramework ??
            (microfrontend ? config.keyLocations?.microfrontend : config.keyLocations?.microfrontends) ??
            location,
        },
      ];
    }),
};

export const gatewayMicrofrontendsClientFramework: JDLSemanticRule = {
  id: 'gateway-microfrontends-client-framework',
  check: ast => {
    const applications = new Map(ast.applications.map(application => [application.config.baseName, application]));
    return ast.applications
      .filter(({ config }) => config.applicationType === 'gateway' && config.clientFramework !== undefined)
      .flatMap(({ config: gateway }) =>
        ((gateway.microfrontends as string[] | undefined) ?? [])
          .map(baseName => applications.get(baseName)?.config)
          .filter(
            microfrontend => microfrontend?.clientFramework !== undefined && microfrontend.clientFramework !== gateway.clientFramework,
          )
          .map(microfrontend => ({
            message: `The microfrontend ${microfrontend!.baseName} uses the client framework ${microfrontend!.clientFramework}, its gateway ${gateway.baseName} ${gateway.clientFramework}: they must use the same one.`,
            location: microfrontend!.keyLocations?.clientFramework,
          })),
      );
  },
};

/** The semantic rules of JHipster, checked with the ones of the jdl. */
export const jhipsterSemanticRules: readonly JDLSemanticRule[] = [
  deploymentType,
  kubernetesIstioIngressDomain,
  microserviceEntity,
  microfrontendClientFramework,
  gatewayMicrofrontendsClientFramework,
];
