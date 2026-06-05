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
      // Bootstrap should not block generation and should not change configuration.
      it('should not have a prompting phase', () => {
        expect(classPropertyNames.includes(generatorModule.default.PROMPTING)).toBeFalsy();
      });
      // Configuration may not be ready at this point. Required composing should be composed at beforeQueue.
      // Optional composing should be done later in loading phase.
      it('should not have a composing phase', () => {
        expect(classPropertyNames.includes(generatorModule.default.COMPOSING)).toBeFalsy();
      });
      // Same reason as composing.
      it('should not have a composingComponent phase', () => {
        expect(classPropertyNames.includes(generatorModule.default.COMPOSING_COMPONENT)).toBeFalsy();
      });
      // Bootstrap should not write anything, it should only prepare configuration for the generators.
      it('should not have a writing phase', () => {
        expect(classPropertyNames.includes(generatorModule.default.WRITING)).toBeFalsy();
      });
      // Same reason as writing.
      it('should not have a postWriting phase', () => {
        expect(classPropertyNames.includes(generatorModule.default.POST_WRITING)).toBeFalsy();
      });
    }
  });
}
