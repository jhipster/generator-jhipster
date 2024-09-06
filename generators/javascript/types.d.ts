export type JavaScriptSourceType = {
  mergePrettierConfig?: (config: Record<string, unknown>) => void;
  addPrettierIgnore?: (newContent: string) => void;

  addEslintIgnore?: (opts: { ignorePattern: string }) => void;
  addEslintConfig?: (opts: { import?: string | string[]; config?: string | string[] }) => void;
};

export type JavaScriptApplication = {
  packageJsonNodeEngine?: boolean | string;
  packageJsonType?: string;
  eslintConfigFile?: string;

  addPrettierExtensions?: (extensions: string[]) => void;
};
