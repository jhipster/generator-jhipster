/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { Merge, PackageJson, Simplify } from 'type-fest';
import type { ExportApplicationPropertiesFromCommand } from '../../lib/command/types.js';
import type JavascriptBootstrapCommand from './generators/bootstrap/command.js';

type JavascriptBootstrapProperties = ExportApplicationPropertiesFromCommand<typeof JavascriptBootstrapCommand>;
type DependencyValue = string | undefined | null;

export type JavaScriptSourceType = {
  mergePrettierConfig?: (config: Record<string, unknown>) => void;
  addPrettierIgnore?: (newContent: string) => void;

  addEslintIgnore?: (opts: { ignorePattern: string }) => void;
  addEslintConfig?: (opts: { import?: string | string[]; config?: string | string[] }) => void;

  /** Merge data to client's package.json */
  mergeClientPackageJson?(
    args: Simplify<
      Merge<PackageJson, { dependencies?: Record<string, DependencyValue>; devDependencies?: Record<string, DependencyValue> }>
    >,
  ): void;
};

export type JavaScriptApplication = JavascriptBootstrapProperties &
  ExportApplicationPropertiesFromCommand<typeof import('./generators/eslint/command.js').default> &
  ExportApplicationPropertiesFromCommand<typeof import('./generators/prettier/command.js').default> & {
    packageJsonNodeEngine?: boolean | string;
    eslintConfigFile?: string;
    cjsExtension?: string;
    mjsExtension?: string;
    /** Root package.json scripts */
    packageJsonScripts: Record<string, string>;
    /** Root package.json scripts */
    clientPackageJsonScripts: Record<string, string>;

    addPrettierExtensions?: (extensions: string[]) => void;
  };
