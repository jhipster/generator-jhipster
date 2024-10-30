import type { ExportApplicationPropertiesFromCommand } from '../../lib/command/types.js';
import type JavascriptBootstrapCommand from './generators/bootstrap/command.ts';

type JavascriptBootstrapProperties = ExportApplicationPropertiesFromCommand<typeof JavascriptBootstrapCommand>;

export type JavaScriptSourceType = {
  mergePrettierConfig?: (config: Record<string, unknown>) => void;
  addPrettierIgnore?: (newContent: string) => void;

  addEslintIgnore?: (opts: { ignorePattern: string }) => void;
  addEslintConfig?: (opts: { import?: string | string[]; config?: string | string[] }) => void;
};

export type JavaScriptApplication = JavascriptBootstrapProperties & {
  packageJsonNodeEngine?: boolean | string;
  eslintConfigFile?: string;
  cjsExtension?: string;
  mjsExtension?: string;
  packageJsonScripts: Record<string, string>;

  addPrettierExtensions?: (extensions: string[]) => void;
};
