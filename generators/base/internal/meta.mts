import { JHipsterApplicationDefinition, JHipsterApplicationConfigs, JHipsterCommandDefinition } from "../api.mjs";

const JHIPSTER_NS = 'jhipster';

type GeneratorMeta = any;

type JHipsterModule = {
  application: JHipsterApplicationDefinition;
  command: JHipsterCommandDefinition;
}

export const getAllDependenciesMetaForGenerators = async (generatorNames: string[], { env, followDependencies }: {env, followDependencies?: boolean}): Promise<Record<string, GeneratorMeta>> => {
  const allDependencies = {};
  const buildGeneratorDependencies = async dependencyName => {
    const meta = await env.getGeneratorMeta(dependencyName.includes(':') ? dependencyName : `${JHIPSTER_NS}:${dependencyName}`);
    if (!meta) {
      return;
    }
    allDependencies[dependencyName] = meta;
    if (followDependencies) {
      const generatorModule = await meta.importModule();
      if (generatorModule.command) {
        for (const dependency of generatorModule.command.import ?? []) {
          if (!allDependencies[dependency]) {
            await buildGeneratorDependencies(dependency);
          }
        }
      }
    }
  };
  for (const generatorName of generatorNames) {
    await buildGeneratorDependencies(generatorName);
  }
  return allDependencies;
};

const getAllDependenciesModulesForGenerators = async (generatorNames: string[], { env }): Promise<Record<string, JHipsterModule>> => {
  const generatorMetas = await getAllDependenciesMetaForGenerators(generatorNames, { env });
  for (const key of Object.keys(generatorMetas)) {
    const module = await generatorMetas[key].importModule();
    if (module) {
      generatorMetas[key] = module;
    } else {
      delete generatorMetas[key];
    }
  }
  return generatorMetas
}

export const loadApplicationConfig = async (generatorNames: string[], application: Record<string, unknown>, applicationConfig: Record<string, unknown>, { env }): Promise<void> => {
  const generatorModules = await getAllDependenciesModulesForGenerators(generatorNames, { env });
  for (const module of Object.values(generatorModules)) {
    for (const [name, config] of Object.entries(module.application.config)) {
      if (application[name] === undefined) {
        application[name] = applicationConfig[name] ?? config.defaultValue;
      }
    }
  }
}

export const prepareApplication = async (generatorNames: string[], application: Record<string, unknown>, { env }): Promise<void> => {
  const generatorModules = await getAllDependenciesModulesForGenerators(generatorNames, { env });
  for (const module of Object.values(generatorModules)) {
    module.application?.prepareApplication?.(application);
  }
}
