import { describe, expect, it } from 'esmocha';

import { checkSemantics } from '../jdl/core/parsing/semantic/index.ts';
import { parseFromContent } from '../jdl/core/readers/jdl-reader.ts';

import { getDefaultRuntime } from './jdl-runtime.ts';

/** The diagnostics of the JHipster rules, with the source each one points at. */
const check = (content: string) =>
  checkSemantics(parseFromContent(content, getDefaultRuntime()), getDefaultRuntime())
    .filter(({ ruleId }) =>
      [
        'deployment-type',
        'kubernetes-istio-ingress-domain',
        'microservice-entity',
        'microfrontend-client-framework',
        'gateway-microfrontends-client-framework',
      ].includes(ruleId),
    )
    .map(({ ruleId, message, location }) => ({
      ruleId,
      message,
      at: location && content.slice(location.startOffset, location.endOffset + 1),
    }));

describe('jdl - JHipster semantic rules', () => {
  describe('deployment-type', () => {
    it('reports a deployment without a type', () => {
      expect(check('deployment {\n  appsFolders [a]\n}')).toEqual([
        {
          ruleId: 'deployment-type',
          message: 'The deploymentType is mandatory to create a deployment.',
          at: 'deployment {\n  appsFolders [a]\n}',
        },
      ]);
    });
  });

  describe('kubernetes-istio-ingress-domain', () => {
    it('reports a kubernetes deployment with istio and no ingress domain', () => {
      expect(check('deployment {\n  deploymentType kubernetes\n  istio true\n}').map(diagnostic => diagnostic.ruleId)).toEqual([
        'kubernetes-istio-ingress-domain',
      ]);
    });
    it('accepts one with an ingress domain', () => {
      expect(check('deployment {\n  deploymentType kubernetes\n  istio true\n  ingressDomain "example.com"\n}')).toEqual([]);
    });
  });

  describe('microservice-entity', () => {
    const jdl = (entities: string) => `application {
  config { baseName store applicationType microservice }
  entities ${entities}
}
application {
  config { baseName orders applicationType microservice }
  entities Order
}
entity Product
entity Order
microservice Order with orders
`;

    it('reports an entity of another microservice in the entity list of a microservice, at its name', () => {
      expect(check(jdl('Product, Order'))).toEqual([
        {
          ruleId: 'microservice-entity',
          message: 'The entity Order of the microservice orders is in the entity list of the microservice store.',
          at: 'Order',
        },
      ]);
    });
    it('reports one listed with *, at the entities statement', () => {
      expect(check(jdl('*'))).toMatchObject([{ ruleId: 'microservice-entity', at: 'entities *' }]);
    });
    it('accepts the entities the microservice gives itself, after the statements of the jdl', () => {
      expect(check(jdl('*').replace('entities *', 'entities *\n  microservice * with store'))).toEqual([]);
    });
    it('accepts the entities of microservices in a gateway', () => {
      expect(
        check(
          'application {\n  config { baseName gw applicationType gateway }\n  entities *\n}\nentity Order\nmicroservice Order with orders',
        ),
      ).toEqual([]);
    });
  });

  describe('microfrontend-client-framework', () => {
    it('reports a microfrontend without client framework, at the microfrontend option', () => {
      expect(check('application {\n  config { baseName blog applicationType microservice microfrontend true }\n}')).toEqual([
        { ruleId: 'microfrontend-client-framework', message: 'The microfrontend blog needs a client framework.', at: 'microfrontend true' },
      ]);
    });
    it('reports a microfrontend without base name', () => {
      expect(check('application {\n  config { microfrontend true }\n}')).toEqual([
        { ruleId: 'microfrontend-client-framework', message: 'The microfrontend needs a client framework.', at: 'microfrontend true' },
      ]);
    });
    it('reports a microfrontend with no client framework, at the client framework', () => {
      expect(
        check('application {\n  config { baseName blog applicationType microservice microfrontend true clientFramework no }\n}'),
      ).toMatchObject([{ ruleId: 'microfrontend-client-framework', at: 'clientFramework no' }]);
    });
    it('reports a gateway serving microfrontends without client framework, at its microfrontends', () => {
      expect(check('application {\n  config { baseName gateway applicationType gateway microfrontends [blog] }\n}')).toEqual([
        {
          ruleId: 'microfrontend-client-framework',
          message: 'The gateway gateway serves microfrontends, and needs a client framework.',
          at: 'microfrontends [blog]',
        },
      ]);
    });
    it('accepts a gateway serving microfrontends with a client framework', () => {
      expect(
        check('application {\n  config { baseName gateway applicationType gateway clientFramework vue microfrontends [blog] }\n}'),
      ).toEqual([]);
    });
    it('accepts a microfrontend with a client framework', () => {
      expect(
        check('application {\n  config { baseName blog applicationType microservice microfrontend true clientFramework react }\n}'),
      ).toEqual([]);
    });
  });

  describe('gateway-microfrontends-client-framework', () => {
    const jdl = (microfrontendClientFramework: string) => `application {
  config { baseName gateway applicationType gateway clientFramework angular microfrontends [blog] }
}
application {
  config { baseName blog applicationType microservice microfrontend true clientFramework ${microfrontendClientFramework} }
}`;

    it('reports a microfrontend of another client framework than its gateway, at its client framework', () => {
      expect(check(jdl('react'))).toEqual([
        {
          ruleId: 'gateway-microfrontends-client-framework',
          message: 'The microfrontend blog uses the client framework react, its gateway gateway angular: they must use the same one.',
          at: 'clientFramework react',
        },
      ]);
    });
    it('accepts microfrontends of the client framework of their gateway', () => {
      expect(check(jdl('angular'))).toEqual([]);
    });
  });
});
