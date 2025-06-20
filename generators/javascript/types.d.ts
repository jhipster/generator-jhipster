import type { Merge, PackageJson, Simplify } from 'type-fest';
import type {
  ExportApplicationPropertiesFromCommand,
  ExportGeneratorOptionsFromCommand,
  ExportStoragePropertiesFromCommand,
} from '../../lib/command/types.js';
import type {
  Application as BaseApplicationApplication,
  Entity as BaseApplicationEntity,
  Field as BaseApplicationField,
  Relationship as BaseApplicationRelationship,
} from '../base-application/index.ts';
import type {
  Application as BaseSimpleApplicationApplication,
  Config as BaseSimpleApplicationConfig,
  Options as BaseSimpleApplicationOptions,
  Source as BaseSimpleApplicationSource,
} from '../base-simple-application/index.ts';
import type EslintCommand from './generators/eslint/command.js';
import type HuskyCommand from './generators/husky/command.js';
import type JavascriptBootstrapCommand from './generators/bootstrap/command.js';
import type PrettierCommand from './generators/prettier/command.js';

export { BaseApplicationRelationship as Relationship, BaseApplicationField as Field };

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

export interface Entity<
  F extends BaseApplicationField = BaseApplicationField,
  R extends BaseApplicationRelationship = BaseApplicationRelationship,
> extends BaseApplicationEntity<F, R> {
  entityFileName: string;
  entityFolderName: string;
  entityModelFileName: string;
  entityParentPathAddition: string;
  entityPluralFileName: string;
  entityServiceFileName: string;

  /** Generate only the model at client side for relationships. */
  entityClientModelOnly?: boolean;
  entityAngularName: string;
  entityAngularNamePlural: string;
  entityReactName: string;
  entityStateName: string;
  entityUrl: string;
  entityPage: string;

  paginationPagination: boolean;
  paginationInfiniteScroll: boolean;
  paginationNo: boolean;

  tsKeyType?: string;
  tsSampleWithPartialData?: string;
  tsSampleWithRequiredData?: string;
  tsSampleWithFullData?: string;
  tsSampleWithNewData?: string;
  tsPrimaryKeySamples?: string[];

  entityAngularJSSuffix?: string;
}

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

export type JavascriptSimpleApplication = BaseSimpleApplicationApplication &
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
  };

export type Application<E extends BaseApplicationEntity = Entity> = BaseApplicationApplication<E> & JavascriptSimpleApplication;
