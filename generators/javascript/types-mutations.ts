import { snakeCase, startCase, upperFirst } from 'lodash-es';
import type { Merge, PackageJson, Simplify } from 'type-fest';

import type {
  ExportApplicationPropertiesFromCommand,
  ExportGeneratorOptionsFromCommand,
  ExportStoragePropertiesFromCommand,
} from '../../lib/command/types.ts';
import type { MutateDataParam } from '../../lib/utils/index.ts';
import type {
  Application as BaseApplicationApplication,
  Entity as BaseApplicationEntity,
  Field as BaseApplicationField,
  Relationship as BaseApplicationRelationship,
} from '../base-application/types.d.ts';
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
import { getTypescriptType } from './support/index.ts';

export type Field = BaseApplicationField & {
  tsType?: string;
};

export type { BaseApplicationRelationship as Relationship };

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

export interface Entity<F extends Field = Field, R extends BaseApplicationRelationship = BaseApplicationRelationship>
  extends BaseApplicationEntity<F, R> {
  entityFileName: string;
  entityFolderName: string;
  entityModelFileName: string;
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

export const mutateField = {
  __override__: false,
  path: ({ fieldName }) => [fieldName],
  propertyName: ({ fieldName }) => fieldName,
  fieldNameCapitalized: ({ fieldName }) => upperFirst(fieldName),
  fieldNameUnderscored: ({ fieldName }) => snakeCase(fieldName),
  fieldNameHumanized: ({ fieldName }) => startCase(fieldName),
  tsType: ({ fieldType }) => getTypescriptType(fieldType),
} as const satisfies MutateDataParam<Field>;
