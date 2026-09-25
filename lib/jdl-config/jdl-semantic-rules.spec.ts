import { describe, expect, it } from 'esmocha';

import { checkSemantics } from '../jdl/core/parsing/semantic/index.ts';
import { parseFromContent } from '../jdl/core/readers/jdl-reader.ts';

import { getDefaultRuntime } from './jdl-runtime.ts';

/** The diagnostics of the JHipster rules, with the source each one points at. */
const check = (content: string) =>
  checkSemantics(parseFromContent(content, getDefaultRuntime()), getDefaultRuntime())
    .filter(({ ruleId }) => ['deployment-type', 'kubernetes-istio-ingress-domain'].includes(ruleId))
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
});
