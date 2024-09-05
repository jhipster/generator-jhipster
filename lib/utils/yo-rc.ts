export const YO_RC_CONFIG_KEY = 'generator-jhipster' as const;

type YoRcContent = Record<typeof YO_RC_CONFIG_KEY, any>;

export const mergeYoRcContent = (oldConfig: YoRcContent, newConfig: YoRcContent): YoRcContent => {
  const merged: YoRcContent = { [YO_RC_CONFIG_KEY]: {} };
  for (const ns of new Set([...Object.keys(oldConfig), ...Object.keys(newConfig)])) {
    merged[ns] = { ...oldConfig[ns], ...newConfig[ns] };
  }
  if (oldConfig[YO_RC_CONFIG_KEY]?.creationTimestamp) {
    merged[YO_RC_CONFIG_KEY]!.creationTimestamp = oldConfig[YO_RC_CONFIG_KEY].creationTimestamp;
  }
  return merged;
};
