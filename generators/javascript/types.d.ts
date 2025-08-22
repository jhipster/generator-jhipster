import type { Merge, PackageJson, Simplify } from 'type-fest';

import type {
  ExportApplicationPropertiesFromCommand,
  ExportGeneratorOptionsFromCommand,
  ExportStoragePropertiesFromCommand,
} from '../../lib/command/types.ts';
import type {
  Application as BaseSimpleApplicationApplication,
  Config as BaseSimpleApplicationConfig,
  Options as BaseSimpleApplicationOptions,
  Source as BaseSimpleApplicationSource,
} from '../base-simple-application/types.d.ts';

import type JavascriptBootstrapCommand from './generators/bootstrap/command.ts';
import type EslintCommand from './generators/eslint/command.ts';
import type HuskyCommand from './generators/husky/command.ts';
import type PrettierCommand from './generators/prettier/command.ts';

export type Config = BaseSimpleApplicationConfig &
  ExportStoragePropertiesFromCommand<typeof EslintCommand> &
  ExportStoragePropertiesFromCommand<typeof HuskyCommand> &
  ExportStoragePropertiesFromCommand<typeof JavascriptBootstrapCommand> &
  ExportStoragePropertiesFromCommand<typeof PrettierCommand>;

export type Options = BaseSimpleApplicationOptions &
  ExportGeneratorOptionsFromCommand<typeof EslintCommand> &
  ExportGeneratorOptionsFromCommand<typeof HuskyCommand> &
  ExportGeneratorOptionsFromCommand<typeof JavascriptBootstrapCommand> &
  ExportGeneratorOptionsFromCommand<typeof PrettierCommand>;

type DependencyValue = string | undefined | null;

export type Source = BaseSimpleApplicationSource & {
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

export type Application = BaseSimpleApplicationApplication &
  ExportApplicationPropertiesFromCommand<typeof EslintCommand> &
  ExportApplicationPropertiesFromCommand<typeof HuskyCommand> &
  ExportApplicationPropertiesFromCommand<typeof PrettierCommand> &
  ExportApplicationPropertiesFromCommand<typeof JavascriptBootstrapCommand> & {
    packageJsonNodeEngine?: boolean | string;
    eslintConfigFile?: string;
    cjsExtension?: string;
    mjsExtension?: string;
    /** Root package.json scripts */
    packageJsonScripts: Record<string, string>;
    /** Root package.json scripts */
    clientPackageJsonScripts: Record<string, string>;

    addPrettierExtensions?: (extensions: string[]) => void;

    prettierFolders?: string;
    prettierExtensions?: string;
  };
