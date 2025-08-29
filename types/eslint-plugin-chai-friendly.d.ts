declare module 'eslint-plugin-chai-friendly' {
  import type { ESLint } from 'eslint';

  interface ChaiPlugin extends ESLint.Plugin {
    configs: {
      recommendedFlat: ESLint.ConfigData;
    };
  }

  const plugin: ChaiPlugin;
  export default plugin;
}
