export const GENERATOR_NAME = 'generator-jhipster';

export const splitBlueprintConfigs = (config: Record<string, any>) => {
  const byNamespaces: Record<string, Record<string, any>> = { [GENERATOR_NAME]: {} };
  Object.entries(config).forEach(([name, value]: [string, any]) => {
    if (name.includes(':')) {
      const [ns, configName] = name.split(':');
      if (!byNamespaces[ns]) {
        byNamespaces[ns] = {};
      }
      byNamespaces[ns][configName] = value;
    } else {
      byNamespaces[GENERATOR_NAME][name] = value;
    }
  });
  return byNamespaces;
};

export const mergeYoRcContent = (oldConfig: Record<string, Record<string, any>>, newConfig: Record<string, Record<string, any>>) => {
  const merged: Record<string, Record<string, any>> = { [GENERATOR_NAME]: {} };
  for (const ns of new Set([...Object.keys(oldConfig), ...Object.keys(newConfig)])) {
    merged[ns] = { ...oldConfig[ns], ...newConfig[ns] };
  }
  if (oldConfig[GENERATOR_NAME]?.creationTimestamp) {
    merged[GENERATOR_NAME].creationTimestamp = oldConfig[GENERATOR_NAME].creationTimestamp;
  }
  return merged;
};
