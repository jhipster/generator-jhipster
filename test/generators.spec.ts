import { before, describe, expect, it } from 'esmocha';

import type BaseCoreGenerator from '../generators/base-core/index.ts';
import type { JHipsterCommandDefinition } from '../generators/index.ts';
import { lookupGeneratorsWithNamespace } from '../lib/utils/index.ts';

const generators = lookupGeneratorsWithNamespace({ absolute: true });

for (const { namespace, generator } of generators) {
  describe(`Generator ${namespace}`, () => {
    let generatorModule: { default: typeof BaseCoreGenerator; command: JHipsterCommandDefinition };
    let classPropertyNames: string[];

    before(async () => {
      generatorModule = await import(generator);
      classPropertyNames = Object.getOwnPropertyNames(generatorModule.default.prototype);
    });

    it('should have a default export', async () => {
      expect(generatorModule.default).toBeDefined();
    });

    if (!namespace.startsWith('base-') && namespace.split(':').length === 1) {
      it('should have a command', async () => {
        const imported = await import(generator);
        expect(imported.command).toBeDefined();
      });
    }

    if (namespace.endsWith(':bootstrap') || namespace.endsWith('-bootstrap')) {
      // Bootstrap should not have any of these priorities, it should only prepare context for the generators.
      it(`should not have any conflicting priorities`, () => {
        const forbiddenPriorities = [
          // Bootstrap should not block generation and should not change configuration.
          generatorModule.default.PROMPTING,
          // Bootstrap should not change configuration.
          generatorModule.default.CONFIGURING,
          // Configuration may not be ready at this point. Bootstrap generator are queued before normal generators.
          // Example:
          // app generator depends on app:bootstrap -> client:bootstrap.
          // client:bootstrap composing will be queued before app composing, so client:bootstrap will compose before client have been queued.
          //
          // Required composing should be composed at beforeQueue.
          // Optional composing should be done later in loading phase.
          generatorModule.default.COMPOSING,
          // Same reason as composing.
          generatorModule.default.COMPOSING_COMPONENT,
          // Bootstrap should not write anything, it should only prepare context for the generators.
          generatorModule.default.WRITING,
          // Same reason as writing.
          generatorModule.default.POST_WRITING,
        ].filter(Boolean);
        for (const priority of forbiddenPriorities) {
          if (
            ['base-simple-application:bootstrap', 'base-workspaces:bootstrap'].includes(namespace) &&
            generatorModule.default.CONFIGURING === priority
          ) {
            // TODO move configuration from bootstrap to generators, then remove this exception.
            continue;
          }
          expect(classPropertyNames).not.toContain(priority);
        }
      });
    }
  });
}
