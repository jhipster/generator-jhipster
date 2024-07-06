export type JavaScriptSourceType = {
  mergePrettierConfig?: (config: Record<string, unknown>) => void;
  addPrettierIgnore?: (newContent: string) => void;
};

export type JavaScriptApplication = {
  packageJsonNodeEngine?: boolean | string;
  packageJsonType?: string;
  eslintConfigFile?: string;
};
